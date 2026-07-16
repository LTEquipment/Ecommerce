"use client";

import { useState } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import OrderReceipt, { type OrderLike } from "@/components/OrderReceipt";
import { Search } from "@/components/icons";

export default function TrackOrderPage() {
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [order, setOrder] = useState<OrderLike | null>(null);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setOrder(null);
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id.trim(), email: email.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.order) throw new Error(json.error || "No order found — check the number and email.");
      setOrder(json.order);
    } catch (e2) {
      setErr((e2 as Error).message || "Something went wrong — try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="wrap content">
      <Breadcrumbs items={[{ label: "Track an order" }]} />
      <header className="page-header"><div className="ph-main"><span className="eyebrow">Orders</span><h1>Track an order</h1></div></header>

      <div className="track">
        <p className="track-lede">Enter your order number and the email on the order to see its status and shipment tracking. Have an account? <Link href="/account?tab=orders">View all your orders</Link>.</p>

        <form className="track-form" onSubmit={lookup}>
          <div className="field"><label>Order number</label><input value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. 3f9a1c20 or the full number" required /></div>
          <div className="field"><label>Email on the order</label><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@yourkitchen.com" required /></div>
          <button className="btn btn-primary" type="submit" disabled={busy}><Search /> {busy ? "Looking…" : "Find my order"}</button>
        </form>

        {err && <p className="track-err">{err}</p>}
        {order && <div className="track-result"><OrderReceipt order={order} /></div>}
      </div>
    </div>
  );
}
