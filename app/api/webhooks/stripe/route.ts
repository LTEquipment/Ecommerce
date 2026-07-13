import { NextResponse } from "next/server";

// Stripe webhook — SCAFFOLD. This is the seam where real payment state gets written.
// Env-guarded no-op (501) until STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET are set.
// When live: verify the signature, then call recordPayment() from "@/lib/recordPayment".
export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured", configured: false }, { status: 501 });
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  // TODO (go-live): verify `signature` against STRIPE_WEBHOOK_SECRET, then dispatch.
  //   import { recordPayment } from "@/lib/recordPayment"            // (already wired to the DB)
  //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)      // npm i stripe
  //   const event = stripe.webhooks.constructEvent(payload, signature!, process.env.STRIPE_WEBHOOK_SECRET!)
  //   switch (event.type) {
  //     case "checkout.session.completed":
  //     case "payment_intent.succeeded":
  //       await recordPayment({ orderId: obj.metadata.order_id, ref: obj.id, amount: obj.amount_total/100, status: "paid" }); break;
  //     case "charge.refunded":               await recordPayment({ orderId, ref, amount, status: "refunded" }); break;
  //     case "payment_intent.payment_failed": await recordPayment({ orderId, ref, amount, status: "failed" }); break;
  //   }
  void payload; void signature;

  return NextResponse.json({ received: true, handled: false, note: "Stripe verification not wired yet — see TODO in this file." });
}
