import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";

export const runtime = "nodejs";

const round2 = (n: number) => Math.round(n * 100) / 100;

function serviceClient(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}

async function requireAdmin() {
  const sb = await getServerSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return data ? user : null;
}

/**
 * POST /api/admin/quotes/convert  { id }
 * Turns a quote request into an order at its QUOTED line-item prices (the quote
 * is the honored price), recomputing freight + tax from site settings so the
 * total matches the storefront money-path. Creates the order + order_items with
 * the service-role key, marks the quote 'won', and audits 'quote.converted'.
 * Order writes use the same tiered fallback as /api/orders so an un-migrated
 * orders table degrades to its core columns rather than failing.
 */
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const svc = serviceClient();
  // select * so converted_order_id loads when present (migration-resilient).
  const { data: quote, error: qErr } = await svc
    .from("quote_requests")
    .select("*, quote_request_items(sku,name,unit_price,qty)")
    .eq("id", id)
    .maybeSingle();
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

  // Idempotency: if this quote was already converted, return that order — never
  // create a duplicate on a second click.
  if (quote.converted_order_id) {
    return NextResponse.json({ ok: true, orderId: quote.converted_order_id as string, already: true });
  }

  type QI = { sku: string | null; name: string; unit_price: number; qty: number };
  const items = (quote.quote_request_items ?? []) as QI[];
  if (items.length === 0) return NextResponse.json({ error: "Quote has no line items" }, { status: 400 });

  const lines = items.map((it) => ({
    sku: it.sku,
    name: it.name,
    unit_price: Number(it.unit_price) || 0,
    qty: Math.max(1, Math.floor(Number(it.qty) || 1)),
  }));
  const subtotal = round2(lines.reduce((s, l) => s + l.unit_price * l.qty, 0));
  const { freightThreshold, freightFee, taxRate } = await getSiteSettings();
  const freight = subtotal >= freightThreshold || subtotal === 0 ? 0 : freightFee;
  const tax = round2(subtotal * taxRate);
  const total = round2(subtotal + freight + tax);

  const customerId = quote.customer_id ?? null;
  if (customerId) {
    await svc.from("customers").upsert({ id: customerId, company: quote.company ?? null, price_list_id: null }, { onConflict: "id" }).then(() => {}, () => {});
  }

  const fullRow: Record<string, unknown> = {
    customer_id: customerId, status: "submitted", subtotal, freight, total,
    payment_method: "wire", payment_status: "pending", amount_paid: 0, paid_at: null,
  };
  let order: { id: string } | null = null;
  let error: { message: string } | null = null;
  ({ data: order, error } = await svc.from("orders").insert(fullRow).select("id").single());
  if (error && /payment_|amount_paid|paid_at|column/.test(error.message)) {
    ({ data: order, error } = await svc
      .from("orders").insert({ customer_id: customerId, status: "submitted", subtotal, freight, total })
      .select("id").single());
  }
  if (error || !order) return NextResponse.json({ error: "Could not create the order" }, { status: 500 });

  const { error: liErr } = await svc.from("order_items").insert(lines.map((l) => ({ ...l, order_id: order!.id })));
  if (liErr) {
    // Roll back the order header so a failed items-insert doesn't strand an empty order.
    await svc.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Could not save the order items" }, { status: 500 });
  }

  // Mark the quote won and stamp the conversion (so a repeat click is idempotent).
  const { error: markErr } = await svc.from("quote_requests").update({ status: "won", converted_order_id: order.id }).eq("id", id);
  if (markErr && /converted_order_id|column/.test(markErr.message)) {
    // migration not run yet — at least record the status.
    await svc.from("quote_requests").update({ status: "won" }).eq("id", id).then(() => {}, () => {});
  }
  await svc.from("audit_log")
    .insert({ actor_id: admin.id, actor_email: admin.email, action: "quote.converted", target: quote.company || id.slice(0, 8), detail: `→ order #${order.id.slice(0, 8)}` })
    .then(() => {}, () => {});

  return NextResponse.json({ ok: true, orderId: order.id, total });
}
