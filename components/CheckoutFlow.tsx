"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "./StoreProvider";
import { useAuth } from "./AuthProvider";
import { money } from "@/lib/format";
import { Check, ArrowRight, Shield, Cart } from "./icons";

const STEPS = ["Contact", "Shipping", "Payment", "Review"];

export default function CheckoutFlow() {
  const { cart, subtotal, count, clear } = useStore();
  const { user } = useAuth();
  const items = Object.values(cart);
  const freight = subtotal >= 999 || subtotal === 0 ? 0 : 89;
  const tax = Math.round(subtotal * 0.08875 * 100) / 100;
  const total = subtotal + freight + tax;

  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<"card" | "affirm" | "wire">("card");
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState<{ no: string; saved: boolean } | null>(null);
  const [f, setF] = useState({
    email: "", phone: "", name: "", company: "", address: "", city: "", state: "", zip: "",
    card: "", exp: "", cvc: "", cardName: "",
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  useEffect(() => {
    if (user?.email) setF((s) => ({ ...s, email: s.email || user.email! }));
  }, [user]);

  const placeOrder = async () => {
    setPlacing(true);
    const orderNo = "LT-" + Date.now().toString().slice(-8);
    let saved = false;
    // Order creation is server-side: /api/orders recomputes every price and total
    // from the catalog and forces payment_status='pending'. The client sends only
    // the SKUs, quantities and chosen method — never prices or payment state.
    if (user) {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map(({ product: p, qty }) => ({ sku: p.sku, qty })),
            payment_method: method,
            company: f.company || null,
          }),
        });
        saved = res.ok;
      } catch {
        /* fall back to demo confirmation */
      }
    }
    clear();
    setPlacing(false);
    setDone({ no: orderNo, saved });
  };

  if (done) {
    return (
      <div className="wrap">
        <div className="auth" style={{ margin: "var(--s6) auto" }}>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--stock)", color: "#fff", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
              <Check style={{ width: 28, height: 28 }} />
            </div>
            <h1>Order placed</h1>
            <p className="sub">Confirmation <b>{done.no}</b></p>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
              Thanks{f.name ? `, ${f.name}` : ""}! We&apos;ll email your confirmation and freight
              schedule shortly.{" "}
              {done.saved
                ? "This order is saved to your account."
                : "This is a demo checkout — no payment was processed."}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
              <Link className="btn btn-primary" href="/products">Keep shopping</Link>
              {done.saved && <Link className="btn btn-line" href="/account?tab=orders">View orders</Link>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="wrap">
        <header className="page-header"><div className="ph-main"><span className="eyebrow">Checkout</span><h1>Checkout</h1></div></header>
        <div className="emptybox">
          <Cart />
          <div className="m">Your cart is empty</div>
          <div className="s">Add equipment to your cart before checking out.</div>
          <Link className="btn btn-primary" href="/products">Browse equipment <ArrowRight /></Link>
        </div>
      </div>
    );
  }

  const canNext =
    (step === 0 && f.email && f.phone) ||
    (step === 1 && f.name && f.address && f.city && f.state && f.zip) ||
    (step === 2 && (method !== "card" || (f.card && f.exp && f.cvc))) ||
    step === 3;

  return (
    <div className="wrap">
      <div className="checkout">
        <div>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={s} className={`step${i === step ? " on" : i < step ? " done" : ""}`}>
                <span className="num">{i < step ? <Check /> : i + 1}</span>
                {s}
              </div>
            ))}
          </div>

          <div className="form-card">
            {step === 0 && (
              <>
                <h2>Contact</h2>
                <div className="field"><label>Email</label><input value={f.email} onChange={set("email")} type="email" placeholder="you@yourkitchen.com" /></div>
                <div className="field"><label>Phone</label><input value={f.phone} onChange={set("phone")} placeholder="(917) 000-0000" /></div>
                {!user && (
                  <p style={{ fontSize: 13, color: "var(--muted)" }}>
                    Have an account? <Link href="/login" style={{ color: "var(--red)", fontWeight: 600 }}>Sign in</Link> to save this order.
                  </p>
                )}
              </>
            )}
            {step === 1 && (
              <>
                <h2>Shipping</h2>
                <div className="field"><label>Full name</label><input value={f.name} onChange={set("name")} /></div>
                <div className="field"><label>Company (optional)</label><input value={f.company} onChange={set("company")} /></div>
                <div className="field"><label>Street address</label><input value={f.address} onChange={set("address")} /></div>
                <div className="field-row">
                  <div className="field"><label>City</label><input value={f.city} onChange={set("city")} /></div>
                  <div className="field"><label>State</label><input value={f.state} onChange={set("state")} /></div>
                </div>
                <div className="field"><label>ZIP</label><input value={f.zip} onChange={set("zip")} /></div>
              </>
            )}
            {step === 2 && (
              <>
                <h2>Payment</h2>
                <div className="pay-methods">
                  {([
                    ["card", "Credit card", "Visa · Mastercard · Amex"],
                    ["affirm", "Affirm — Buy now, pay later", "4 interest-free payments or monthly financing"],
                    ["wire", "Wire transfer", "We'll email wiring instructions"],
                  ] as const).map(([id, label, desc]) => (
                    <button type="button" key={id} className={`pay-method${method === id ? " on" : ""}`} onClick={() => setMethod(id)}>
                      <span className="pm-radio" />
                      <span className="pm-txt"><b>{label}</b><span>{desc}</span></span>
                    </button>
                  ))}
                </div>
                {method === "card" ? (
                  <>
                    <div className="field"><label>Name on card</label><input value={f.cardName} onChange={set("cardName")} /></div>
                    <div className="field"><label>Card number</label><input value={f.card} onChange={set("card")} placeholder="4242 4242 4242 4242" inputMode="numeric" /></div>
                    <div className="field-row">
                      <div className="field"><label>Expiry</label><input value={f.exp} onChange={set("exp")} placeholder="MM/YY" /></div>
                      <div className="field"><label>CVC</label><input value={f.cvc} onChange={set("cvc")} placeholder="123" inputMode="numeric" /></div>
                    </div>
                    <p style={{ fontSize: 12.5, color: "var(--muted)", display: "flex", gap: 8, alignItems: "center" }}>
                      <Shield style={{ width: 16, height: 16 }} /> Demo checkout — no card is charged. Live Stripe processing activates once keys are configured.
                    </p>
                  </>
                ) : method === "affirm" ? (
                  <div className="affirm-note">
                    <div className="affirm-head"><span className="affirm-badge">Affirm</span><b>Pay over time</b></div>
                    <p>As low as <b>{money(Math.round(total / 12))}/mo</b> — choose 3, 6 or 12-month terms with Affirm at checkout. Quick eligibility check, no hidden fees.</p>
                    <p className="affirm-demo">Demo — Affirm financing activates once your Affirm keys are configured.</p>
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                    We&apos;ll email wire-transfer instructions with your confirmation. Production is scheduled once payment is received.
                  </p>
                )}
              </>
            )}
            {step === 3 && (
              <>
                <h2>Review &amp; place order</h2>
                <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--ink-2)" }}>
                  <div><b>{f.name}</b>{f.company ? ` · ${f.company}` : ""}</div>
                  <div>{f.address}, {f.city}, {f.state} {f.zip}</div>
                  <div>{f.email} · {f.phone}</div>
                  <div style={{ marginTop: 8, color: "var(--muted)" }}>
                    {method === "card" ? `Card ending ${f.card.slice(-4) || "••••"}` : method === "affirm" ? "Affirm · Buy now, pay later" : "Wire transfer"}
                  </div>
                </div>
                <div style={{ borderTop: "1px solid var(--line)", marginTop: 16, paddingTop: 12 }}>
                  {items.map(({ product: p, qty }) => (
                    <div key={p.sku} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "5px 0" }}>
                      <span>{qty} × {p.name}</span><span>{money(p.price * qty)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="form-actions">
              {step > 0 ? <button className="btn btn-line" onClick={() => setStep((s) => s - 1)}>Back</button> : <span />}
              {step < 3 ? (
                <button className="btn btn-primary" disabled={!canNext} style={{ opacity: canNext ? 1 : 0.5 }} onClick={() => setStep((s) => s + 1)}>Continue</button>
              ) : (
                <button className="btn btn-primary btn-lg" disabled={placing} onClick={placeOrder}>
                  {placing ? "Placing…" : `Place order · ${money(total)}`}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="summary">
          <h2>Summary</h2>
          <div className="sum-items">
            {items.map(({ product: p, qty }) => (
              <div className="sum-item" key={p.sku}>
                <span className="th">{p.images[0] ? <img src={p.images[0]} alt="" /> : null}</span>
                <span className="nm">{p.name}<span className="qn"> · Qty {qty}</span></span>
                <span className="lp">{money(p.price * qty)}</span>
              </div>
            ))}
          </div>
          {subtotal < 999 && (
            <div className="freight-nudge">
              Add <b>{money(999 - subtotal)}</b> more for free freight
              <span className="fbar"><i style={{ width: `${Math.min(100, (subtotal / 999) * 100)}%` }} /></span>
            </div>
          )}
          <div className="line"><span>Subtotal ({count})</span><b>{money(subtotal)}</b></div>
          <div className="line"><span>Freight</span><b>{freight ? money(freight) : "FREE"}</b></div>
          <div className="line"><span>Tax (est.)</span><b>{money(tax)}</b></div>
          <div className="total"><span>Total</span><span className="v">{money(total)}</span></div>
          <div className="note">Secure demo checkout · nothing is charged</div>
        </div>
      </div>
    </div>
  );
}
