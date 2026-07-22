import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  erpConfigured,
  erpOrderPushReady,
  flattenShipTo,
  pushOrderToErp,
  recordErpPush,
} from "@/lib/erp";

export const runtime = "nodejs";

/** Only real admins (present in the `admins` table) may replay orders. */
async function requireAdmin() {
  const sb = await getServerSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return data ? user : null;
}

function admin() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

/**
 * GET — what is waiting, and whether push is safe to switch on.
 *
 * Returns the preflight alongside the backlog because the two questions are
 * always asked together, and because the preflight is explicit about the check
 * it cannot perform.
 */
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = admin();
  if (!db) return NextResponse.json({ error: "Backend not connected" }, { status: 500 });

  const { data, error } = await db
    .from("orders")
    .select("id,erp_status,erp_error,erp_attempts,erp_last_try_at")
    .in("erp_status", ["pending", "failed"])
    .order("erp_last_try_at", { ascending: true })
    .limit(100);

  // The column set only exists once supabase/erp-order-queue.sql has been run.
  if (error) {
    return NextResponse.json({
      migrationApplied: false,
      hint: "run supabase/erp-order-queue.sql",
      error: error.message,
    });
  }

  const waiting = data ?? [];
  return NextResponse.json({
    migrationApplied: true,
    pushEnabled: erpConfigured(),
    preflight: await erpOrderPushReady(),
    replayable: waiting.filter((o) => o.erp_status === "pending").length,
    // Deterministic rejections. Retrying these unchanged is pointless — they
    // are listed so a person can read problems[] and fix the cause.
    needsAttention: waiting
      .filter((o) => o.erp_status === "failed")
      .map((o) => ({ id: o.id, attempts: o.erp_attempts, error: o.erp_error })),
  });
}

/**
 * POST — replay orders whose push was inconclusive.
 *
 * Only 'pending' rows are swept. A 'failed' row was rejected deterministically
 * and would be rejected identically again, so replaying it would burn rate
 * limit and bury the real problem.
 *
 * Replaying is safe to run repeatedly: each order goes back with its original
 * external_id and Idempotency-Key, so an order the ERP already accepted comes
 * back as that same order rather than a second one.
 */
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!erpConfigured()) {
    return NextResponse.json({ error: "Order push is off (ERP_ORDER_PUSH)" }, { status: 409 });
  }
  const db = admin();
  if (!db) return NextResponse.json({ error: "Backend not connected" }, { status: 500 });

  const { limit = 25 } = (await req.json().catch(() => ({}))) as { limit?: number };

  // Typed explicitly: a built select string defeats supabase-js's inference,
  // which otherwise widens every column to an error type.
  type QueuedOrder = {
    id: string;
    total: number | string;
    po_number: string | null;
    payment_method: string | null;
    erp_customer: string | null;
    erp_attempts: number | null;
    ship_name: string | null;
    ship_company: string | null;
    ship_phone: string | null;
    ship_address: string | null;
    ship_city: string | null;
    ship_state: string | null;
    ship_zip: string | null;
    guest_email: string | null;
    created_at: string | null;
  };

  const { data, error } = await db
    .from("orders")
    .select(
      "id,total,po_number,payment_method,erp_customer,erp_attempts," +
        "ship_name,ship_company,ship_phone,ship_address,ship_city,ship_state,ship_zip," +
        "guest_email,created_at"
    )
    .eq("erp_status", "pending")
    .order("erp_last_try_at", { ascending: true })
    .limit(Math.min(Math.max(1, limit), 100));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const orders = (data ?? []) as unknown as QueuedOrder[];

  const results: { id: string; ok: boolean; detail: string }[] = [];

  for (const o of orders) {
    const { data: items } = await db
      .from("order_items")
      .select("sku,name,qty,unit_price")
      .eq("order_id", o.id);

    // An order with no lines cannot be sent — lines[] is the one thing the ERP
    // always validates. Flagged rather than retried forever.
    if (!items?.length) {
      await db.from("orders").update({ erp_status: "failed", erp_error: "no order_items to send" }).eq("id", o.id);
      results.push({ id: o.id, ok: false, detail: "no line items" });
      continue;
    }

    const res = await pushOrderToErp({
      externalId: o.id,
      // Prefer what was actually sent the first time; the checkout's `company`
      // field is not persisted, so re-deriving it would change the customer.
      customer: o.erp_customer || o.ship_company || o.ship_name || o.guest_email || `Web order ${o.id}`,
      contact: o.ship_name ?? null,
      email: o.guest_email ?? null,
      phone: o.ship_phone ?? null,
      shippingAddress: flattenShipTo(o as Record<string, string | null | undefined>),
      amount: Number(o.total),
      currencyCode: "USD",
      poNumber: o.po_number ?? null,
      paymentMethod: o.payment_method ?? null,
      date: o.created_at ? String(o.created_at).slice(0, 10) : undefined,
      items: items.map((l) => ({
        sku: String(l.sku),
        name: String(l.name),
        qty: Number(l.qty),
        unit_price: Number(l.unit_price),
      })),
    });

    await recordErpPush(db, o.id, res, Number(o.erp_attempts ?? 0) + 1);
    results.push({
      id: o.id,
      ok: res.ok,
      detail: res.ok ? res.salesOrderId : [res.reason, ...(res.problems ?? [])].join(" | "),
    });
  }

  return NextResponse.json({
    attempted: results.length,
    sent: results.filter((r) => r.ok).length,
    stillWaiting: results.filter((r) => !r.ok).length,
    results,
  });
}
