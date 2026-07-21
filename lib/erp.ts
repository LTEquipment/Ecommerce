// Server-only: imported solely from the orders route handler, and reads env
// vars without a NEXT_PUBLIC_ prefix so they are never bundled for the client.

/**
 * Pushes a placed order into the ERP (a separate Supabase project) as a
 * sales_order, via its ingest-storefront-order edge function.
 *
 * The storefront holds only ERP_INGEST_TOKEN — never the ERP's service-role key.
 * A public web app should not be able to reach payroll, banking or suppliers if
 * it is ever compromised, so its entire ERP access is "may submit one order".
 *
 * Disabled unless both env vars are set, so nothing reaches the ERP until it is
 * deliberately switched on.
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

export function erpConfigured(): boolean {
  return Boolean(process.env.ERP_INGEST_URL && process.env.ERP_INGEST_TOKEN);
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
    const res = await fetch(process.env.ERP_INGEST_URL!, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.ERP_INGEST_TOKEN!}`,
      },
      body: JSON.stringify({
        external_id: order.externalId,
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
        items: order.items.map((l) => ({
          sku: l.sku ?? null,
          name: l.name,
          qty: l.qty,
          unit_price: l.unit_price,
        })),
      }),
    });

    const body = (await res.json().catch(() => ({}))) as {
      salesOrderId?: string;
      duplicate?: boolean;
      error?: string;
    };
    if (!res.ok || !body.salesOrderId) {
      return { ok: false, reason: body.error ?? `http ${res.status}` };
    }
    return { ok: true, salesOrderId: body.salesOrderId, duplicate: Boolean(body.duplicate) };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "network" };
  } finally {
    clearTimeout(timer);
  }
}
