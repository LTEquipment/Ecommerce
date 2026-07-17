"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import OrderReceipt, { type OrderLike } from "@/components/OrderReceipt";
import { Check, ArrowRight } from "@/components/icons";

export default function ConfirmationPage() {
  const { user } = useAuth();
  const [state, setState] = useState<"loading" | "ok" | "none">("loading");
  const [order, setOrder] = useState<OrderLike | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    let raw: string | null = null;
    try { raw = sessionStorage.getItem("lt-last-order"); } catch { /* private mode */ }
    if (!raw) { setState("none"); return; }
    const { id, email, name: n } = JSON.parse(raw) as { id: string; email: string; name?: string };
    setName(n || "");
    fetch("/api/orders/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, email }) })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => { setOrder(j.order); setState("ok"); })
      // Order was created; if the lookup can't confirm details, still show success with the id.
      .catch(() => { setOrder({ id }); setState("ok"); });
  }, []);

  if (state === "loading") {
    return <div className="wrap"><div className="conf"><div className="skel skel-row" style={{ maxWidth: 520, margin: "var(--s7) auto" }} /></div></div>;
  }

  if (state === "none") {
    return (
      <div className="wrap">
        <div className="conf conf-empty">
          <h1>No recent order to show</h1>
          <p className="sub">Looking for an order you placed earlier? Track it with your order number and email.</p>
          <div className="conf-actions">
            <Link className="btn btn-primary" href="/track">Track an order <ArrowRight /></Link>
            <Link className="btn btn-line" href="/products">Browse equipment</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="conf">
        <div className="conf-mark no-print"><Check /></div>
        <h1 className="no-print">Order placed</h1>
        <p className="conf-lede no-print">
          Thanks{name ? `, ${name.split(" ")[0]}` : ""}! We&apos;ve received your order. A confirmation and freight
          schedule will follow by email. Nothing is charged today — our team confirms pricing, freight and payment before production.
        </p>

        {order && <OrderReceipt order={order} />}

        <div className="conf-actions no-print">
          {user ? (
            <Link className="btn btn-primary" href="/account?tab=orders">View your orders</Link>
          ) : (
            <Link className="btn btn-primary" href="/track">Track this order</Link>
          )}
          <Link className="btn btn-line" href="/products">Keep shopping</Link>
        </div>
        {!user && <p className="conf-tip no-print">Tip: save your order number above — you can check its status anytime at <Link href="/track">/track</Link> with your email.</p>}
      </div>
    </div>
  );
}
