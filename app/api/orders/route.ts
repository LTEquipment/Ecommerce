import { NextResponse } from "next/server";
import { erpConfigured, flattenShipTo, pushOrderToErp, recordErpPush } from "@/lib/erp";
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
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  // Session is optional: signed-in orders link to the customer; guest orders are
  // persisted with a guest contact so nothing is ever silently dropped.
  const supabase = await getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "Backend not connected" }, { status: 500 });
  const { data: { user } } = await supabase.auth.getUser();

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const b = (body ?? {}) as { items?: unknown; payment_method?: unknown; company?: unknown; shipping?: unknown; email?: unknown; name?: unknown; phone?: unknown };

  // Guests must supply a valid contact email so the order is reachable + fulfillable.
  const guestEmail = typeof b.email === "string" ? b.email.trim().slice(0, 200) : "";
  if (!user && !EMAIL_RE.test(guestEmail)) {
    return NextResponse.json({ error: "A valid email is required to place a guest order" }, { status: 400 });
  }

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

  // Contract pricing: approved dealers get the admin-set discount applied per line.
  const { freightThreshold, freightFee, taxRate, dealerDiscountPct } = await getSiteSettings();
  const approvedDealer = ((user?.app_metadata as Record<string, unknown> | undefined)?.dealer_status) === "approved";
  const discountMult = approvedDealer && dealerDiscountPct > 0 ? 1 - dealerDiscountPct / 100 : 1;

  let subtotal = 0;
  const lines: Array<{ sku: string; name: string; unit_price: number; qty: number }> = [];
  for (const it of reqItems) {
    const qty = Math.max(1, Math.min(999, Math.floor(Number(it?.qty) || 0)));
    const p = bySku.get(String(it?.sku));
    if (!p) return NextResponse.json({ error: `Unknown item: ${String(it?.sku)}` }, { status: 400 });
    const unit = round2(p.price * discountMult);
    subtotal += unit * qty;
    lines.push({ sku: p.sku, name: p.name, unit_price: unit, qty });
  }
  subtotal = round2(subtotal);
  // Freight from settings; tax is 0 for a tax-exempt order (verified by staff
  // before payment, since nothing is charged online). This is the authoritative total.
  const freight = subtotal >= freightThreshold || subtotal === 0 ? 0 : freightFee;
  const taxExempt = (b as { tax_exempt?: unknown }).tax_exempt === true;
  const tax = taxExempt ? 0 : round2(subtotal * taxRate);
  const total = round2(subtotal + freight + tax);
  const poNumber = typeof (b as { po_number?: unknown }).po_number === "string" ? ((b as { po_number: string }).po_number).trim().slice(0, 60) || null : null;
  const resaleCert = typeof (b as { resale_cert?: unknown }).resale_cert === "string" ? ((b as { resale_cert: string }).resale_cert).trim().slice(0, 120) || null : null;

  // Service-role client for the writes (bypasses RLS). customer_id is taken from
  // the verified session, never from the request body.
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Soft rate limit: bound order flooding (no one legitimately places a dozen
  // orders a minute). Keyed by customer for members, by guest email otherwise.
  const since = new Date(Date.now() - 60_000).toISOString();
  const rl = admin.from("orders").select("id", { count: "exact", head: true }).gte("created_at", since);
  const { count: recent } = await (user ? rl.eq("customer_id", user.id) : rl.eq("guest_email", guestEmail));
  if ((recent ?? 0) >= 12) {
    return NextResponse.json({ error: "Too many orders in a short time — please wait a moment." }, { status: 429 });
  }

  if (user) await admin.from("customers").upsert({ id: user.id, company, price_list_id: null }, { onConflict: "id" });

  // Persist the typed contact email on EVERY order (members too) so the order is
  // lookuppable at /track and /checkout/confirmation by the email the buyer
  // actually entered — a member may route the confirmation to a different inbox.
  const contactEmail = EMAIL_RE.test(guestEmail) ? guestEmail : null;
  const guestFields: { guest_email?: string | null; guest_name?: string | null; guest_phone?: string | null } = user
    ? (contactEmail ? { guest_email: contactEmail } : {})
    : { guest_email: contactEmail, guest_name: shipStr(b.name, 120) ?? shipping.ship_name, guest_phone: shipStr(b.phone, 40) ?? shipping.ship_phone };
  // One mutable row; if an optional column group is missing (its migration not run),
  // strip that group and retry — the order always saves on its core columns.
  const row: Record<string, unknown> = {
    customer_id: user?.id ?? null, status: "submitted", subtotal, freight, total,
    payment_method: method, payment_status: "pending", amount_paid: 0, paid_at: null,
    po_number: poNumber, tax_exempt: taxExempt, resale_cert: resaleCert,
    ...shipping, ...guestFields,
  };
  const insertRow = () => admin.from("orders").insert(row).select("id").single();
  const strip = (keys: string[]) => { keys.forEach((k) => delete row[k]); return insertRow(); };
  let { data: order, error } = await insertRow();
  if (error && /po_number|tax_exempt|resale_cert/.test(error.message)) ({ data: order, error } = await strip(["po_number", "tax_exempt", "resale_cert"]));
  if (error && /ship_|column/.test(error.message)) ({ data: order, error } = await strip(["ship_name", "ship_company", "ship_phone", "ship_address", "ship_city", "ship_state", "ship_zip"]));
  if (error && /guest_|column/.test(error.message)) ({ data: order, error } = await strip(["guest_email", "guest_name", "guest_phone"]));
  if (error && /payment_|amount_paid|paid_at|column/.test(error.message)) ({ data: order, error } = await strip(["payment_method", "payment_status", "amount_paid", "paid_at"]));
  if (error || !order) return NextResponse.json({ error: "Could not create order" }, { status: 500 });

  const { error: liErr } = await admin.from("order_items")
    .insert(lines.map((l) => ({ ...l, order_id: order!.id })));
  if (liErr) {
    // Roll back the header so a failed items-insert doesn't strand an itemless order.
    await admin.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Could not save items" }, { status: 500 });
  }

  // Mirror the order into the ERP as a sales_order. Deliberately awaited but
  // never fatal: the customer's order is already committed, so an ERP outage
  // must not turn a successful payment into a failed checkout. Idempotent on
  // the storefront order id, so a retry cannot double-book.
  if (erpConfigured()) {
    // `customer` is required and an empty string is rejected. Every element of
    // the old chain could be absent at once — a signed-in order with no company
    // and no ship-to sent null — so it ends in the order id, which always
    // exists. A reference beats a rejected order.
    const erpCustomer =
      company || shipping.ship_company || shipping.ship_name || contactEmail || `Web order ${order.id}`;

    const erp = await pushOrderToErp({
      externalId: order.id,
      amount: total,
      customer: erpCustomer,
      contact: shipping.ship_name ?? null,
      email: contactEmail,
      phone: shipping.ship_phone ?? null,
      shippingAddress: flattenShipTo(shipping as Record<string, string | null | undefined>),
      // Real columns, so these travel as themselves. They briefly rode inside
      // notes because the ERP's allow-list rejected columns its own schema had.
      poNumber: poNumber ?? null,
      paymentMethod: method ?? null,
      currencyCode: "USD",
      items: lines.map((l) => ({ sku: l.sku, name: l.name, qty: l.qty, unit_price: Number(l.unit_price) })),
    });
    // The order row is the queue: an inconclusive push is left 'pending' for
    // the replay sweep, a deterministic rejection is left 'failed' for a human.
    await recordErpPush(admin, order.id, erp, 1, erpCustomer);
    if (!erp.ok) {
      // Never silent: the customer has paid regardless of what the ERP said.
      // problems[] is logged verbatim rather than collapsed to "order failed",
      // because it names every fault at once and is the only way to tell a bad
      // payload from an outage. A 400 is deterministic and is never retried.
      console.error(
        `[erp] order ${order.id} NOT mirrored (${erp.reason})` +
          (erp.problems?.length ? `\n[erp] problems: ${erp.problems.join(" | ")}` : "") +
          (erp.retryable ? "\n[erp] retryable — needs replay" : "\n[erp] not retryable — needs a fix, not a retry")
      );
    }
  }

  return NextResponse.json({ id: order.id, total });
}
