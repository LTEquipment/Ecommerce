import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import { getProducts } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/settings";

export const runtime = "nodejs";

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Creates an order. ALL money is recomputed server-side from the catalog — the
 * client sends only { items: [{sku, qty}], payment_method, company }. Payment
 * state is forced to 'pending'; only a signature-verified payment webhook
 * (lib/recordPayment.ts) may ever mark an order 'paid'. Inserts run with the
 * service-role key so this stays the single trusted order-creation path even
 * after direct client INSERT on orders/order_items is revoked (see
 * supabase/orders-hardening.sql).
 */
export async function POST(req: Request) {
  // Authenticate via the caller's session cookie (anon client).
  const supabase = await getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "Backend not connected" }, { status: 500 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const b = (body ?? {}) as { items?: unknown; payment_method?: unknown; company?: unknown; shipping?: unknown };

  const reqItems = Array.isArray(b.items) ? (b.items as Array<{ sku?: unknown; qty?: unknown }>) : [];
  if (reqItems.length === 0) return NextResponse.json({ error: "Empty cart" }, { status: 400 });
  if (reqItems.length > 100) return NextResponse.json({ error: "Too many line items" }, { status: 400 });

  const method = ["card", "affirm", "wire"].includes(b.payment_method as string)
    ? (b.payment_method as string) : "wire";
  const company = typeof b.company === "string" ? b.company.slice(0, 200) : null;

  // Ship-to address (collected at checkout). Clamped; stored so orders are fulfillable.
  const s = (b.shipping ?? {}) as Record<string, unknown>;
  const shipStr = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
  const shipping = {
    ship_name: shipStr(s.name, 120),
    ship_company: shipStr(s.company, 200),
    ship_phone: shipStr(s.phone, 40),
    ship_address: shipStr(s.address, 240),
    ship_city: shipStr(s.city, 120),
    ship_state: shipStr(s.state, 60),
    ship_zip: shipStr(s.zip, 20),
  };

  // Authoritative prices from the catalog — never trust client-sent prices.
  const catalog = await getProducts();
  const bySku = new Map(catalog.map((p) => [p.sku, p]));

  let subtotal = 0;
  const lines: Array<{ sku: string; name: string; unit_price: number; qty: number }> = [];
  for (const it of reqItems) {
    const qty = Math.max(1, Math.min(999, Math.floor(Number(it?.qty) || 0)));
    const p = bySku.get(String(it?.sku));
    if (!p) return NextResponse.json({ error: `Unknown item: ${String(it?.sku)}` }, { status: 400 });
    subtotal += p.price * qty;
    lines.push({ sku: p.sku, name: p.name, unit_price: p.price, qty });
  }
  subtotal = round2(subtotal);
  // Freight + tax from site settings (defaults match the storefront's displayed
  // summary). This is the authoritative total.
  const { freightThreshold, freightFee, taxRate } = await getSiteSettings();
  const freight = subtotal >= freightThreshold || subtotal === 0 ? 0 : freightFee;
  const tax = round2(subtotal * taxRate);
  const total = round2(subtotal + freight + tax);

  // Service-role client for the writes (bypasses RLS). customer_id is taken from
  // the verified session, never from the request body.
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Soft per-user rate limit: bound order flooding (no one legitimately places a
  // dozen orders a minute). Not perfectly atomic, but enough to stop a script.
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count: recent } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", user.id)
    .gte("created_at", since);
  if ((recent ?? 0) >= 12) {
    return NextResponse.json({ error: "Too many orders in a short time — please wait a moment." }, { status: 429 });
  }

  await admin.from("customers").upsert({ id: user.id, company, price_list_id: null }, { onConflict: "id" });

  const fullRow = {
    customer_id: user.id, status: "submitted", subtotal, freight, total,
    payment_method: method, payment_status: "pending", amount_paid: 0, paid_at: null,
    ...shipping,
  };
  let order: { id: string } | null = null;
  let error: { message: string } | null = null;
  ({ data: order, error } = await admin.from("orders").insert(fullRow).select("id").single());
  if (error && /ship_|column/.test(error.message)) {
    // order-shipping.sql not run yet — retry without the ship_ columns (keep payment).
    const { ship_name, ship_company, ship_phone, ship_address, ship_city, ship_state, ship_zip, ...noShip } = fullRow;
    void ship_name; void ship_company; void ship_phone; void ship_address; void ship_city; void ship_state; void ship_zip;
    ({ data: order, error } = await admin.from("orders").insert(noShip).select("id").single());
  }
  if (error && /payment_|amount_paid|paid_at|column/.test(error.message)) {
    // payments.sql migration not run yet — fall back to core order columns.
    ({ data: order, error } = await admin
      .from("orders").insert({ customer_id: user.id, status: "submitted", subtotal, freight, total })
      .select("id").single());
  }
  if (error || !order) return NextResponse.json({ error: "Could not create order" }, { status: 500 });

  const { error: liErr } = await admin.from("order_items")
    .insert(lines.map((l) => ({ ...l, order_id: order!.id })));
  if (liErr) return NextResponse.json({ error: "Could not save items" }, { status: 500 });

  return NextResponse.json({ id: order.id, total });
}
