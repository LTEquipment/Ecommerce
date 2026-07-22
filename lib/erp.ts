// Server-only: imported solely from the orders route handler, and reads env
// vars without a NEXT_PUBLIC_ prefix so they are never bundled for the client.

/**
 * Pushes a placed order into the ERP (a separate Supabase project) as a
 * sales_order, via its Partner API `POST /orders`.
 *
 * This used to target a bespoke `ingest-storefront-order` edge function, which
 * was never deployed — so `ERP_INGEST_URL`/`ERP_INGEST_TOKEN` were never set and
 * no order has ever actually reached the ERP. The Partner API supersedes it.
 *
 * The storefront holds only a scoped partner key — never the ERP's service-role
 * key. That key's permissions are products, categories, pricing, inventory and
 * orders; it cannot reach the CRM, invoices, payroll or the general ledger. A
 * public web app must not be able to read those if it is ever compromised.
 */

export type ErpLine = { sku?: string | null; name: string; qty: number; unit_price: number };

export type ErpOrder = {
  /** Storefront order id — becomes external_id, and the idempotency key. */
  externalId: string;
  placedAt?: string;
  customer?: string | null;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  amount: number;
  poNumber?: string | null;
  paymentMethod?: string | null;
  ship?: Record<string, string | null | undefined>;
  items: ErpLine[];
};

/**
 * Three things must be true, not two.
 *
 * ERP_API_URL and ERP_API_KEY are also what the catalog sync uses, and that is
 * a read. Order push is a write into the ERP's sales pipeline, so it needs its
 * own switch: without ERP_ORDER_PUSH=on, having sync credentials on the box
 * would silently start posting real customer orders the moment this shipped.
 *
 * It matters right now because the key we hold reports `"partner": "TEST"` and
 * stamps everything it creates with `external_source: "TEST"`. Real orders
 * pushed today land in a test tenant. Leave this off until someone confirms the
 * key is production.
 */
export function erpConfigured(): boolean {
  return Boolean(
    process.env.ERP_API_URL && process.env.ERP_API_KEY && process.env.ERP_ORDER_PUSH === "on"
  );
}

/**
 * Never throws and never rejects: a checkout must not fail because the ERP is
 * unreachable. The customer's order is already saved by the time this runs —
 * losing the ERP copy is recoverable, losing the sale is not. Returns a result
 * so the caller can log it.
 */
export async function pushOrderToErp(
  order: ErpOrder
): Promise<{ ok: true; salesOrderId: string; duplicate: boolean } | { ok: false; reason: string }> {
  if (!erpConfigured()) return { ok: false, reason: "not-configured" };

  const controller = new AbortController();
  // Bounded so a hanging ERP can't hold a serverless invocation open.
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${process.env.ERP_API_URL}/orders`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ERP_API_KEY!,
      },
      // Only `lines[]` is confirmed: it is the one field the API validates, and
      // GET /schema names `external_id` as the idempotency key. Every other
      // field here is sent on the shape the ERP's own sales_orders table uses,
      // but the API accepts unknown keys silently rather than rejecting them,
      // so none of it is proven to be stored. Read one pushed order back before
      // trusting this — a field that is quietly dropped looks identical to a
      // field that worked.
      body: JSON.stringify({
        external_id: order.externalId,
        external_source: "storefront",
        placed_at: order.placedAt ?? new Date().toISOString(),
        customer: order.customer ?? null,
        contact: order.contact ?? null,
        email: order.email ?? null,
        phone: order.phone ?? null,
        amount: order.amount,
        currency_code: "USD",
        po_number: order.poNumber ?? null,
        payment_method: order.paymentMethod ?? null,
        ship: order.ship ?? {},
        lines: order.items.map((l) => ({
          sku: l.sku ?? null,
          name: l.name,
          qty: l.qty,
          unit_price: l.unit_price,
        })),
      }),
    });

    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      id?: string;
      error?: string;
    };
    if (!res.ok || !body.id) {
      return { ok: false, reason: body.error ?? `http ${res.status}` };
    }
    // The API reports no duplicate flag, so a retry of the same external_id
    // cannot be distinguished from a first push here. Idempotency has to be
    // enforced ERP-side on (external_source, external_id).
    return { ok: true, salesOrderId: body.id, duplicate: false };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "network" };
  } finally {
    clearTimeout(timer);
  }
}
