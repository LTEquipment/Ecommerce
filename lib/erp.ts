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

export type ErpLine = { sku: string; name: string; qty: number; unit_price: number };

export type ErpOrder = {
  /** Storefront order id — becomes external_id, and the idempotency key. */
  externalId: string;
  date?: string;
  /** Required, and rejected if empty. The caller must guarantee a value. */
  customer: string;
  contact?: string | null;
  phone?: string | null;
  /** One line of text — the ERP stores the ship-to as a single column. */
  shippingAddress?: string | null;
  amount: number;
  notes?: string | null;
  items: ErpLine[];
};

/** Flattens the storefront's ship-to into the single line the ERP stores. */
export function flattenShipTo(s: Record<string, string | null | undefined>): string | null {
  const line = [
    s.ship_name,
    s.ship_company,
    s.ship_address,
    [s.ship_city, s.ship_state].filter(Boolean).join(", "),
    s.ship_zip,
  ]
    .map((v) => (v ?? "").trim())
    .filter(Boolean)
    .join(" · ");
  return line || null;
}

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
): Promise<
  | { ok: true; salesOrderId: string; duplicate: boolean }
  | { ok: false; reason: string; problems?: string[]; retryable: boolean }
> {
  if (!erpConfigured()) return { ok: false, reason: "not-configured", retryable: false };

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
        // Honoured on genuine retries (timeout, 5xx, network drop). Repeating
        // external_id is guarded ERP-side too; both are used rather than
        // guessing whether an earlier attempt got through.
        "Idempotency-Key": order.externalId,
      },
      // Exactly the fields the ERP documents. Unknown keys are now rejected
      // rather than dropped, so anything speculative here would fail the order
      // outright. Deliberately absent, and open with the ERP team:
      //   email          — no documented field; the storefront keeps it
      //   payment_method — no documented field
      //   currency_code  — not documented; USD is the ERP default
      //   external_source, id, stage — the ERP assigns these
      body: JSON.stringify({
        external_id: order.externalId,
        customer: order.customer,
        contact: order.contact ?? null,
        phone: order.phone ?? null,
        shipping_address: order.shippingAddress ?? null,
        amount: order.amount,
        notes: order.notes ?? null,
        date: order.date,
        lines: order.items.map((l) => ({
          sku: l.sku,
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
      problems?: string[];
    };

    if (!res.ok || !body.id) {
      // A 400 is deterministic — the same payload will fail identically, so
      // retrying only burns rate limit. 5xx and network faults are the only
      // things worth sending again.
      const retryable = res.status >= 500 || res.status === 429;
      return {
        ok: false,
        reason: body.error ?? `http ${res.status}`,
        problems: body.problems,
        retryable,
      };
    }
    // Repeating an external_id returns the existing order rather than creating
    // a second one, but the response does not distinguish the two cases.
    return { ok: true, salesOrderId: body.id, duplicate: false };
  } catch (e) {
    // A timeout or dropped connection says nothing about whether the ERP
    // processed the order, so this is replayable — the Idempotency-Key and
    // external_id are what stop a replay becoming a duplicate.
    return { ok: false, reason: e instanceof Error ? e.message : "network", retryable: true };
  } finally {
    clearTimeout(timer);
  }
}
