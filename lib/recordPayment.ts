import { createClient } from "@supabase/supabase-js";

/**
 * Write payment state onto an order + append a ledger row. Called from verified
 * provider webhooks (Stripe / Affirm) once live keys are configured. Server-only:
 * uses the service-role key, which bypasses RLS.
 */
export async function recordPayment(opts: {
  orderId: string;
  ref: string;
  amount: number;
  method?: string;
  provider?: string;
  status: "paid" | "refunded" | "failed";
}) {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  await db.from("orders").update({
    payment_status: opts.status,
    paid_at: opts.status === "paid" ? new Date().toISOString() : null,
    amount_paid: opts.status === "paid" ? opts.amount : 0,
    payment_ref: opts.ref,
    ...(opts.method ? { payment_method: opts.method } : {}),
  }).eq("id", opts.orderId);
  await db.from("payments").insert({
    order_id: opts.orderId,
    provider: opts.provider ?? "stripe",
    provider_ref: opts.ref,
    method: opts.method ?? "card",
    status: opts.status === "paid" ? "succeeded" : opts.status,
    amount: opts.amount,
  });
}
