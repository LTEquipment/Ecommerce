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
  email?: string | null;
  phone?: string | null;
  /** One line of text — the ERP stores the ship-to as a single column. */
  shippingAddress?: string | null;
  amount: number;
  currencyCode?: string;
  poNumber?: string | null;
  paymentMethod?: string | null;
  /** Genuine customer instructions only — never a smuggled field. */
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
export type ErpPushResult = Awaited<ReturnType<typeof pushOrderToErp>>;

/**
 * Records the outcome on the order row, which doubles as the replay queue.
 *
 * Best-effort and never throws: this runs after the customer has already paid,
 * so failing to write a status column must not surface as a failed checkout.
 * If the migration has not run the update simply no-ops, matching how the
 * order insert tolerates absent optional columns.
 *
 * A deterministic rejection is stored as 'failed' and is deliberately NOT
 * picked up by the replay sweep — the same payload will fail identically, so
 * it needs a person, not a retry.
 */
export async function recordErpPush(
  admin: { from: (table: string) => any }, // eslint-disable-line @typescript-eslint/no-explicit-any
  orderId: string,
  result: ErpPushResult,
  attempts: number,
  customerSent?: string
): Promise<void> {
  const patch: Record<string, unknown> = {
    erp_attempts: attempts,
    erp_last_try_at: new Date().toISOString(),
  };
  if (customerSent) patch.erp_customer = customerSent;
  if (result.ok) {
    patch.erp_status = "sent";
    patch.erp_order_id = result.salesOrderId;
    patch.erp_error = null;
  } else {
    patch.erp_status = result.retryable ? "pending" : "failed";
    patch.erp_error = [result.reason, ...(result.problems ?? [])].join(" | ").slice(0, 1000);
  }
  try {
    await admin.from("orders").update(patch).eq("id", orderId);
  } catch {
    /* migration not run — the console log at the call site remains the record */
  }
}

/**
 * Checks what can be checked before order push is switched on.
 *
 * It cannot prove the thing that matters most. The ERP's `sales_orders.email`
 * and `po_number` columns must exist before the function ships, or every insert
 * fails — and no read-only call reveals whether a migration ran. The only way
 * to test it is to POST, which writes a real order. So this verifies the
 * contract the API advertises and reports the rest as unverifiable rather than
 * implying a green light.
 */
export async function erpOrderPushReady(): Promise<{
  ready: boolean;
  checks: { name: string; ok: boolean; detail: string }[];
}> {
  const checks: { name: string; ok: boolean; detail: string }[] = [];
  const base = process.env.ERP_API_URL;
  const key = process.env.ERP_API_KEY;
  if (!base || !key) {
    return { ready: false, checks: [{ name: "credentials", ok: false, detail: "ERP_API_URL/ERP_API_KEY unset" }] };
  }
  const headers = { "x-api-key": key, accept: "application/json" };

  try {
    const spec = (await (await fetch(`${base}/openapi.json`, { headers })).json()) as {
      paths?: Record<string, { post?: { requestBody?: unknown } }>;
    };
    const props =
      ((spec.paths?.["/orders"]?.post?.requestBody as Record<string, any>)?.content?.["application/json"]
        ?.schema?.properties as Record<string, unknown>) ?? {};
    // Every field we actually send must be one the API admits to accepting.
    const required = ["email", "po_number", "payment_method", "currency_code", "shipping_address", "external_id"];
    const missing = required.filter((f) => !(f in props));
    checks.push({
      name: "order contract",
      ok: missing.length === 0,
      detail: missing.length ? `not advertised: ${missing.join(", ")}` : `all ${required.length} fields advertised`,
    });
  } catch (e) {
    checks.push({ name: "order contract", ok: false, detail: e instanceof Error ? e.message : "unreachable" });
  }

  try {
    const res = await fetch(`${base}/banana`, { headers });
    checks.push({
      name: "hardened routing",
      ok: res.status === 404,
      detail: res.status === 404 ? "unknown routes 404" : `unknown route returned ${res.status}, expected 404`,
    });
  } catch {
    checks.push({ name: "hardened routing", ok: false, detail: "unreachable" });
  }

  try {
    const h = (await (await fetch(`${base}/health`, { headers })).json()) as { partner?: string };
    checks.push({
      name: "production key",
      ok: h.partner !== "TEST",
      detail: `partner is "${h.partner}"${h.partner === "TEST" ? " — one key, named TEST, writing to production" : ""}`,
    });
  } catch {
    checks.push({ name: "production key", ok: false, detail: "unreachable" });
  }

  checks.push({
    name: "sales_orders.email / po_number exist",
    ok: false,
    detail: "cannot be verified without writing an order — needs confirmation that supabase db push ran",
  });
  checks.push({
    name: "durable replay queue",
    ok: false,
    detail: "not built — a push lost to an outage is not replayed",
  });

  return { ready: checks.every((c) => c.ok), checks };
}

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
      // Every field here is a real sales_orders column, confirmed by the ERP
      // team. `email` and `po_number` were added for us; the earlier
      // allow-list rejected four of these despite the columns existing, which
      // is why payment_method briefly rode inside notes. It no longer does —
      // notes carries only what a customer actually typed.
      //
      // These require the ERP's pending migration + function deploy. Order push
      // is off, so nothing is sent in the meantime; see erpOrderPushReady()
      // before switching it on.
      //
      // Still assigned by the ERP, never sent: external_source, id, stage.
      body: JSON.stringify({
        external_id: order.externalId,
        customer: order.customer,
        contact: order.contact ?? null,
        email: order.email ?? null,
        phone: order.phone ?? null,
        shipping_address: order.shippingAddress ?? null,
        amount: order.amount,
        currency_code: order.currencyCode ?? "USD",
        po_number: order.poNumber ?? null,
        payment_method: order.paymentMethod ?? null,
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
