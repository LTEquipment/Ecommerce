"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import Breadcrumbs from "@/components/Breadcrumbs";
import OrderReceipt, { type OrderLike } from "@/components/OrderReceipt";

type State = "loading" | "ok" | "missing" | "signedout";

export default function AccountOrderPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user, loading } = useAuth();
  const [state, setState] = useState<State>("loading");
  const [order, setOrder] = useState<OrderLike | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { setState("signedout"); return; }
    const sb = getBrowserSupabase();
    if (!sb) { setState("missing"); return; }
    // RLS scopes this to the signed-in customer's own orders — another account's
    // order id simply returns nothing.
    sb.from("orders")
      .select("*, order_items(sku, name, qty, unit_price)")
      .eq("id", id)
      .eq("customer_id", user.id)
      .maybeSingle()
      .then(
        ({ data }) => { if (data) { setOrder(data as OrderLike); setState("ok"); } else setState("missing"); },
        () => setState("missing")
      );
  }, [id, user, loading]);

  const short = `#${String(id).slice(0, 8).toUpperCase()}`;

  return (
    <div className="wrap content">
      <Breadcrumbs items={[{ label: "Account", href: "/account" }, { label: "Orders", href: "/account?tab=orders" }, { label: short }]} />

      {state === "loading" ? (
        <div className="skel skel-row" style={{ maxWidth: 620, margin: "var(--s6) auto" }} />
      ) : state === "signedout" ? (
        <div className="conf conf-empty">
          <h1>Sign in to view this order</h1>
          <p className="sub">This order is only visible to the account that placed it.</p>
          <div className="conf-actions"><Link className="btn btn-primary" href={`/login?next=/account/orders/${id}`}>Sign in</Link></div>
        </div>
      ) : state === "missing" ? (
        <div className="conf conf-empty">
          <h1>Order not found</h1>
          <p className="sub">We couldn&apos;t find that order on your account.</p>
          <div className="conf-actions"><Link className="btn btn-line" href="/account?tab=orders">Your orders</Link></div>
        </div>
      ) : order ? (
        <div className="acct-order">
          <div className="acct-order-head no-print">
            <h1>Order {short}</h1>
            <Link className="link-arrow" href="/account?tab=orders">All orders →</Link>
          </div>
          <OrderReceipt order={order} />
        </div>
      ) : null}
    </div>
  );
}
