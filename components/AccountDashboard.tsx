"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { money } from "@/lib/format";
import { LogOut } from "./icons";

type Order = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  order_items?: { name: string; qty: number; unit_price: number }[];
};

export default function AccountDashboard() {
  const { user, loading, configured, displayName, signOut } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const tab = params.get("tab") === "orders" ? "orders" : "profile";
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!loading && configured && !user) router.replace("/login?next=/account");
  }, [loading, configured, user, router]);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase || !user) return;
    const fetchOrders = () =>
      supabase
        .from("orders")
        .select("id, created_at, status, total, order_items(name, qty, unit_price)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setOrders((data as Order[]) ?? []));
    fetchOrders();
    // Live: refetch when any of this customer's orders change.
    const channel = supabase
      .channel("rt-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `customer_id=eq.${user.id}` },
        () => fetchOrders()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!configured) {
    return (
      <div className="wrap">
        <div className="auth">
          <div className="card">
            <h1>Account</h1>
            <p className="sub">Accounts aren&apos;t connected in this environment.</p>
            <div className="msg info">Add Supabase keys to <b>.env.local</b> to enable sign-in and order history (see README).</div>
            <Link className="btn btn-line btn-block" href="/">Back to home</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !user) {
    return <div className="wrap" style={{ padding: "var(--s7) 0", color: "var(--muted)" }}>Loading your account…</div>;
  }

  return (
    <div className="wrap">
      <div className="account">
        <h1>Your account</h1>
        <aside className="acct-side">
          <div className="who"><b>{displayName}</b><span>{user.email}</span></div>
          <nav>
            <button className={tab === "profile" ? "on" : ""} onClick={() => router.push("/account")}>Profile</button>
            <button className={tab === "orders" ? "on" : ""} onClick={() => router.push("/account?tab=orders")}>
              Orders <span>{orders?.length ?? "·"}</span>
            </button>
            <button onClick={() => { signOut(); router.push("/"); }}><span style={{ display: "flex", gap: 8, alignItems: "center" }}><LogOut style={{ width: 16, height: 16 }} /> Sign out</span></button>
          </nav>
        </aside>

        <div className="acct-main">
          {tab === "profile" ? (
            <div className="panel">
              <h2 style={{ marginTop: 0 }}>Profile</h2>
              <div className="field"><label>Company / kitchen</label><input defaultValue={displayName} /></div>
              <div className="field"><label>Email</label><input defaultValue={user.email} disabled /></div>
              <p style={{ fontSize: 13, color: "var(--muted)" }}>Contract pricing and multi-unit billing are set up by your account manager — <Link href="/contact" style={{ color: "var(--red)", fontWeight: 600 }}>get in touch</Link>.</p>
            </div>
          ) : (
            <div className="panel">
              <h2 style={{ marginTop: 0 }}>Orders</h2>
              {orders === null ? (
                <p style={{ color: "var(--muted)" }}>Loading orders…</p>
              ) : orders.length === 0 ? (
                <p style={{ color: "var(--muted)" }}>No orders yet. <Link href="/products" style={{ color: "var(--red)", fontWeight: 600 }}>Start shopping</Link>.</p>
              ) : (
                orders.map((o) => (
                  <div className="order" key={o.id}>
                    <div className="oh">
                      <span>#{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleDateString()}</span>
                      <span className="ostatus">{o.status}</span>
                    </div>
                    <div style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
                      {(o.order_items ?? []).map((it, i) => (
                        <div key={i}>{it.qty} × {it.name}</div>
                      ))}
                    </div>
                    <div style={{ textAlign: "right", fontWeight: 700, marginTop: 8 }}>{money(o.total)}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
