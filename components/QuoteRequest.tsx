"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useStore } from "./StoreProvider";
import { useAuth } from "./AuthProvider";
import { money } from "@/lib/format";
import { Close, FileText } from "./icons";

/**
 * "Request a quote" for the whole cart — the core B2B path. Opens a modal that
 * collects contact info and submits the cart's {sku, qty} to /api/quotes.
 */
export default function QuoteRequest({ variant = "page" }: { variant?: "page" | "drawer" }) {
  const { cart } = useStore();
  const { user } = useAuth();
  const items = Object.values(cart);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [doneId, setDoneId] = useState<string | null>(null);

  const openModal = () => {
    const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
    setForm((f) => ({
      ...f,
      email: user?.email ?? f.email,
      name: (meta.full_name as string) ?? f.name,
      company: (meta.company as string) ?? f.company,
    }));
    setErr("");
    setDoneId(null);
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items: items.map((i) => ({ sku: i.product.sku, qty: i.qty })) }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) setErr(d.error || "Could not submit your request.");
      else setDoneId(d.id);
    } catch {
      setErr("Network error — please try again.");
    }
    setBusy(false);
  };

  if (items.length === 0) return null;

  return (
    <>
      <button
        type="button"
        className={variant === "drawer" ? "btn btn-line btn-block" : "btn btn-line btn-block btn-lg"}
        onClick={openModal}
      >
        <FileText /> Request a quote
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div className="qr-overlay" onClick={() => setOpen(false)}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Request a quote">
            <button className="qr-close" onClick={() => setOpen(false)} aria-label="Close"><Close /></button>

            {doneId ? (
              <div className="qr-done">
                <h3>Quote requested</h3>
                <p>
                  Thanks — your request <b>#{doneId.slice(0, 8)}</b> is in. Our New York team will email a
                  formal quote with freight and lead times for {items.length === 1 ? "this item" : `these ${items.length} items`} shortly.
                </p>
                <button className="btn btn-primary" onClick={() => setOpen(false)}>Done</button>
              </div>
            ) : (
              <form onSubmit={submit} className="qr-form">
                <h3>Request a quote</h3>
                <p className="qr-sub">Formal pricing, freight and lead times for your cart — no obligation.</p>
                <div className="qr-items">
                  {items.map((i) => (
                    <div key={i.product.sku} className="qr-line">
                      <span>{i.qty} × {i.product.name}</span>
                      <span>{money(i.product.price * i.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="qr-grid">
                  <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <input placeholder="Company / kitchen" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                  <input type="email" required placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <textarea
                  placeholder="Anything we should know — install site, timing, gas type, delivery details…"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                />
                {err && <div className="qr-err">{err}</div>}
                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
                  {busy ? "Submitting…" : "Submit request"}
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
