import { NextResponse } from "next/server";

// Affirm (Buy Now, Pay Later) — SCAFFOLD (outbound seam). The client obtains a
// checkout_token via Affirm.js, POSTs it here; the server authorizes + captures
// the charge against Affirm's API and writes payment state. Env-guarded until keys exist.
export const runtime = "nodejs";

export async function POST() {
  if (!process.env.AFFIRM_PRIVATE_KEY || !process.env.AFFIRM_PUBLIC_KEY) {
    return NextResponse.json({ error: "Affirm not configured", configured: false }, { status: 501 });
  }

  // TODO (go-live): authorize + capture the Affirm charge, then record payment.
  //   const base = process.env.AFFIRM_ENV === "production" ? "https://api.affirm.com" : "https://sandbox.affirm.com";
  //   const auth = "Basic " + Buffer.from(`${process.env.AFFIRM_PUBLIC_KEY}:${process.env.AFFIRM_PRIVATE_KEY}`).toString("base64");
  //   const charge = await fetch(`${base}/api/v2/charges`, {
  //     method: "POST", headers: { Authorization: auth, "Content-Type": "application/json" },
  //     body: JSON.stringify({ checkout_token }),
  //   }).then((r) => r.json());
  //   await fetch(`${base}/api/v2/charges/${charge.id}/capture`, { method: "POST", headers: { Authorization: auth } });
  //   Then, via the Supabase service-role key, update the order:
  //     orders.update({ payment_status: "paid", paid_at: now, amount_paid: charge.amount/100,
  //                     payment_method: "affirm", payment_ref: charge.id }).eq("id", orderId)
  //     payments.insert({ order_id: orderId, provider: "affirm", provider_ref: charge.id,
  //                       method: "affirm", status: "succeeded", amount: charge.amount/100 })
  return NextResponse.json({ error: "Affirm charge capture not wired yet — see TODO in this file." }, { status: 501 });
}
