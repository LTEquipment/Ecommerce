import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Stripe webhook — SCAFFOLD. This is the seam where real payment state gets written.
// Until STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET are set it is a safe no-op (501).
// recordPayment() below is already wired to the DB, so going live only needs the
// signature-verify + event-dispatch step marked TODO in POST().
export const runtime = "nodejs";

function serviceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

/** Write payment state onto an order and append a ledger row. Called from verified Stripe events. */
export async function recordPayment(opts: {
  orderId: string;
  ref: string;
  amount: number;
  method?: string;
  status: "paid" | "refunded" | "failed";
}) {
  const db = serviceClient();
  await db.from("orders").update({
    payment_status: opts.status,
    paid_at: opts.status === "paid" ? new Date().toISOString() : null,
    amount_paid: opts.status === "paid" ? opts.amount : 0,
    payment_ref: opts.ref,
    ...(opts.method ? { payment_method: opts.method } : {}),
  }).eq("id", opts.orderId);
  await db.from("payments").insert({
    order_id: opts.orderId,
    provider: "stripe",
    provider_ref: opts.ref,
    method: opts.method ?? "card",
    status: opts.status === "paid" ? "succeeded" : opts.status,
    amount: opts.amount,
  });
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured", configured: false }, { status: 501 });
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  // TODO (go-live): verify `signature` against STRIPE_WEBHOOK_SECRET, then dispatch:
  //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)          // npm i stripe
  //   const event = stripe.webhooks.constructEvent(payload, signature!, process.env.STRIPE_WEBHOOK_SECRET!)
  //   switch (event.type) {
  //     case "checkout.session.completed":
  //     case "payment_intent.succeeded":
  //       await recordPayment({ orderId: obj.metadata.order_id, ref: obj.id, amount: obj.amount_total/100, status: "paid" }); break;
  //     case "charge.refunded":            await recordPayment({ orderId, ref, amount, status: "refunded" }); break;
  //     case "payment_intent.payment_failed": await recordPayment({ orderId, ref, amount, status: "failed" }); break;
  //   }
  void payload; void signature;

  return NextResponse.json({ received: true, handled: false, note: "Stripe verification not wired yet — see TODO in this file." });
}
