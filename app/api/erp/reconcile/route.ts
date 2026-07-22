import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * Order reconciliation for the ERP. Ids and totals only.
 *
 * This is the whole of the storefront's read surface, deliberately. The ERP is
 * the system of record for web orders and receives each one through
 * `POST /orders`, so it does not need to read order data back — what push
 * cannot answer is "do I have all of them?", and that is the only question
 * this endpoint exists to settle.
 *
 * Customer names, addresses, phones and line items are **not** returned. They
 * travel in the push already, and a second copy behind a second key is a second
 * thing that can leak. A gap found here is closed by replaying the order
 * through `POST /orders`, not by widening this response.
 *
 * Both ids are returned. They are the same value today — the storefront sends
 * its own order id as `external_id` — but the ERP joins on `external_id`, and
 * returning one field that happens to serve as two makes the day they diverge
 * an undebuggable one.
 */

/** Widest window a single call may ask for. Reconciliation is periodic. */
const MAX_RANGE_DAYS = 366;

type Row = { id: string; created_at: string | null; total: number | string; status: string | null };

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: Request) {
  const configured = process.env.STOREFRONT_ERP_KEY;
  // Absent key means the endpoint is off, not open. Never fail open.
  if (!configured) return NextResponse.json({ error: "Not enabled" }, { status: 503 });

  const presented = req.headers.get("x-api-key") ?? "";
  // Length-independent comparison is not worth the ceremony here, but an
  // early-exit on length keeps the obvious probe cheap.
  if (presented.length !== configured.length || presented !== configured) return unauthorized();

  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (!from || !to) {
    return NextResponse.json(
      { error: "from and to are required (YYYY-MM-DD)" },
      { status: 400 }
    );
  }
  const fromMs = Date.parse(`${from}T00:00:00Z`);
  const toMs = Date.parse(`${to}T23:59:59Z`);
  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) {
    return NextResponse.json({ error: "from and to must be YYYY-MM-DD" }, { status: 400 });
  }
  if (toMs < fromMs) {
    return NextResponse.json({ error: "to is before from" }, { status: 400 });
  }
  if (toMs - fromMs > MAX_RANGE_DAYS * 86400_000) {
    return NextResponse.json(
      { error: `range exceeds ${MAX_RANGE_DAYS} days` },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) {
    return NextResponse.json({ error: "Backend not connected" }, { status: 500 });
  }
  const admin = createClient(supabaseUrl, key, { auth: { persistSession: false } });

  const { data, error } = await admin
    .from("orders")
    .select("id,created_at,total,status")
    .gte("created_at", new Date(fromMs).toISOString())
    .lte("created_at", new Date(toMs).toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[erp/reconcile] query failed:", error.message);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  const rows = (data ?? []) as Row[];

  // Customer data leaving the system needs a trail. The storefront's audit
  // table (supabase/audit-log.sql) is not applied, so this is a log line until
  // it is — deliberately noted rather than silently skipped.
  console.info(
    `[erp/reconcile] ${from}..${to} → ${rows.length} orders (audit_log table not applied)`
  );

  return NextResponse.json({
    from,
    to,
    count: rows.length,
    orders: rows.map((o) => ({
      id: o.id,
      // What the storefront sends as external_id on POST /orders.
      external_id: o.id,
      created_at: o.created_at,
      total: Number(o.total),
      status: o.status,
    })),
  });
}
