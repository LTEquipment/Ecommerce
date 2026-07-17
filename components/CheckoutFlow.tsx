"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "./StoreProvider";
import { useAuth } from "./AuthProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { useSiteSettings } from "./SiteSettingsProvider";
import { ADDRESS_COLS, type Address } from "@/lib/addresses";
import { money } from "@/lib/format";
import { Check, ArrowRight, Shield, Cart } from "./icons";

const STEPS = ["Contact", "Shipping", "Payment", "Review"];

const round2 = (n: number) => Math.round(n * 100) / 100;

export default function CheckoutFlow() {
  const { cart, subtotal, count, clear, toast } = useStore();
  const { user, isDealer } = useAuth();
  const router = useRouter();
  const { freightThreshold, freightFee, taxRate, dealerDiscountPct } = useSiteSettings();
  const items = Object.values(cart);

  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<"card" | "affirm" | "wire">("card");
  const [placing, setPlacing] = useState(false);
  const [taxExempt, setTaxExempt] = useState(false);
  const [f, setF] = useState({
    email: "", phone: "", name: "", company: "", address: "", city: "", state: "", zip: "",
    card: "", exp: "", cvc: "", cardName: "", po: "", resaleCert: "",
  });

  // Contract pricing for approved dealers, computed per line to match the server.
  const dealerPct = isDealer ? dealerDiscountPct : 0;
  const netSubtotal = round2(items.reduce((s, { product: p, qty }) => s + round2(p.price * (1 - dealerPct / 100)) * qty, 0));
  const dealerDiscount = round2(subtotal - netSubtotal);
  const freight = netSubtotal >= freightThreshold || netSubtotal === 0 ? 0 : freightFee;
  const tax = taxExempt ? 0 : round2(netSubtotal * taxRate);
  const total = round2(netSubtotal + freight + tax);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const [saved, setSaved] = useState<Address[]>([]);
  const [saveAddr, setSaveAddr] = useState(false);

  useEffect(() => {
    if (user?.email) setF((s) => ({ ...s, email: s.email || user.email! }));
    const sb = getBrowserSupabase();
    if (!user || !sb) return;
    sb.from("customer_addresses")
      .select(ADDRESS_COLS)
      .order("is_default", { ascending: false })
      .then(({ data }) => setSaved((data as Address[]) ?? []));
  }, [user]);

  const fillFrom = (a: Address) =>
    setF((s) => ({
      ...s,
      name: a.name || "", company: a.company || "", phone: a.phone || s.phone,
      address: a.address, city: a.city || "", state: a.state || "", zip: a.zip || "",
    }));

  const placeOrder = async () => {
    setPlacing(true);
    // Order creation is server-side: /api/orders recomputes every price and total
    // from the catalog and forces payment_status='pending'. The client sends only
    // the SKUs, quantities, contact and chosen method — never prices or payment
    // state. Guests are persisted too (keyed by email), so no order is dropped.
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ product: p, qty }) => ({ sku: p.sku, qty })),
          payment_method: method,
          company: f.company || null,
          email: f.email, name: f.name, phone: f.phone,
          po_number: f.po || null,
          tax_exempt: taxExempt,
          resale_cert: taxExempt ? (f.resaleCert || null) : null,
          shipping: {
            name: f.name, company: f.company, phone: f.phone,
            address: f.address, city: f.city, state: f.state, zip: f.zip,
          },
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!res.ok || !json.id) throw new Error(json.error || "");
      if (user && saveAddr && f.address.trim()) {
        const sb = getBrowserSupabase();
        sb?.from("customer_addresses")
          .insert({ user_id: user.id, label: f.company || f.city || null, name: f.name, company: f.company, phone: f.phone, address: f.address, city: f.city, state: f.state, zip: f.zip })
          .then(() => {}, () => {});
      }
      // Hand the real order id + email to the confirmation page (survives refresh,
      // never placed in the URL).
      try { sessionStorage.setItem("lt-last-order", JSON.stringify({ id: json.id, email: f.email, name: f.name })); } catch { /* private mode */ }
      clear();
      router.push("/checkout/confirmation");
    } catch (e) {
      const m = (e as Error).message;
      toast(m ? `Couldn’t place the order — ${m}` : "Couldn’t place the order — try again", "error");
    } finally {
      setPlacing(false);
    }
  };

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
                {saved.length > 0 && (
                  <div className="co-saved">
                    <span className="co-saved-lbl">Use a saved address</span>
                    <div className="co-saved-chips">
                      {saved.map((a) => (
                        <button type="button" key={a.id} className="co-saved-chip" onClick={() => fillFrom(a)}>
                          <b>{a.label || a.address}</b>
                          <span>{[a.city, a.state].filter(Boolean).join(", ")} {a.zip}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="field"><label>Full name</label><input value={f.name} onChange={set("name")} /></div>
                <div className="field"><label>Company (optional)</label><input value={f.company} onChange={set("company")} /></div>
                <div className="field"><label>Street address</label><input value={f.address} onChange={set("address")} /></div>
                <div className="field-row">
                  <div className="field"><label>City</label><input value={f.city} onChange={set("city")} /></div>
                  <div className="field"><label>State</label><input value={f.state} onChange={set("state")} /></div>
                </div>
                <div className="field"><label>ZIP</label><input value={f.zip} onChange={set("zip")} /></div>
                {user && f.address.trim() && (
                  <label className="co-save-addr">
                    <input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} />
                    Save this address for next time
                  </label>
                )}
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

                <div className="co-b2b">
                  <div className="field"><label>PO number <span className="co-opt">optional</span></label><input value={f.po} onChange={set("po")} placeholder="Your purchase order #" /></div>
                  <label className="trade-check co-exempt">
                    <input type="checkbox" checked={taxExempt} onChange={(e) => setTaxExempt(e.target.checked)} />
                    <span>
                      <b>Tax-exempt purchase (resale / reseller)</b>
                      <em>We&apos;ll verify your certificate before payment — nothing is charged today.</em>
                    </span>
                  </label>
                  {taxExempt && (
                    <div className="field"><label>Resale / exemption certificate #</label><input value={f.resaleCert} onChange={set("resaleCert")} placeholder="Certificate number" /></div>
                  )}
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
                <span className="th">{p.images[0] ? <img src={p.images[0]} alt="" loading="lazy" decoding="async" /> : null}</span>
                <span className="nm">{p.name}<span className="qn"> · Qty {qty}</span></span>
                <span className="lp">{money(p.price * qty)}</span>
              </div>
            ))}
          </div>
          {netSubtotal > 0 && netSubtotal < freightThreshold && (
            <div className="freight-nudge">
              Add <b>{money(freightThreshold - netSubtotal)}</b> more for free freight
              <span className="fbar"><i style={{ width: `${Math.min(100, (netSubtotal / freightThreshold) * 100)}%` }} /></span>
            </div>
          )}
          <div className="line"><span>Subtotal ({count})</span><b>{money(subtotal)}</b></div>
          {dealerDiscount > 0 && (
            <div className="line co-disc"><span>Dealer discount ({dealerPct}%)</span><b>−{money(dealerDiscount)}</b></div>
          )}
          <div className="line"><span>Freight</span><b>{freight ? money(freight) : "FREE"}</b></div>
          <div className="line"><span>{taxExempt ? "Tax (exempt)" : "Tax (est.)"}</span><b>{taxExempt ? "$0.00" : money(tax)}</b></div>
          <div className="total"><span>Total</span><span className="v">{money(total)}</span></div>
          <div className="note">Secure demo checkout · nothing is charged</div>
        </div>
      </div>
    </div>
  );
}
