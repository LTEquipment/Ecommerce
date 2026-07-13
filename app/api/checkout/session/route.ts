import { NextResponse } from "next/server";

// Stripe Checkout Session — SCAFFOLD (outbound seam). When live keys exist, the
// card path in checkout POSTs its cart here to get a redirect URL. Until then the
// storefront uses the in-app demo checkout, so this returns 501 (not configured).
export const runtime = "nodejs";

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured", configured: false }, { status: 501 });
  }

  // TODO (go-live): create a Checkout Session with the cart line items and an
  // order_id in metadata, then return { url } for a client redirect:
  //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)                    // npm i stripe
  //   const session = await stripe.checkout.sessions.create({
  //     mode: "payment",
  //     line_items: items.map(i => ({ price_data: { currency: "usd", product_data: { name: i.name },
  //       unit_amount: Math.round(i.unit_price * 100) }, quantity: i.qty })),
  //     success_url: `${origin}/checkout?paid=1`, cancel_url: `${origin}/cart`,
  //     metadata: { order_id },
  //   })
  //   return NextResponse.json({ url: session.url })
  return NextResponse.json({ error: "Checkout session creation not wired yet — see TODO in this file." }, { status: 501 });
}
