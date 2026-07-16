"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import type { Product } from "@/lib/types";

/** Back-in-stock capture. The dead "Notify me" button becomes a real email opt-in. */
export default function StockNotify({ p }: { p: Product }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const start = () => {
    setEmail(user?.email ?? "");
    setOpen(true);
    setErr("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/notify-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: p.slug, email: email.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(d.error || "Could not save your request.");
      } else {
        setDone(true);
      }
    } catch {
      setErr("Network error — please try again.");
    }
    setBusy(false);
  };

  if (done) {
    return (
      <div className="notify-done" role="status">
        Thanks — we&apos;ll email you the moment this is back in stock.
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" className="btn btn-line btn-lg notify-trigger" onClick={start}>
        Notify me when available
      </button>
    );
  }

  return (
    <form className="notify-form" onSubmit={submit}>
      <input
        type="email"
        required
        placeholder="you@restaurant.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email for back-in-stock alert"
        autoFocus
      />
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Saving…" : "Notify me"}
      </button>
      {err && <div className="notify-err">{err}</div>}
    </form>
  );
}
