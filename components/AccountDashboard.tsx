"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { useStore } from "./StoreProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { money } from "@/lib/format";
import { LogOut, Package } from "./icons";

type Order = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  order_items?: { name: string; qty: number; unit_price: number }[];
};

export default function AccountDashboard() {
  const { user, loading, configured, displayName, signOut } = useAuth();
  const { toast } = useStore();
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
          <div className="who">
            <span className="ava">{displayName?.[0]?.toUpperCase() || "L"}</span>
            <div style={{ minWidth: 0 }}><b>{displayName}</b><span>{user.email}</span></div>
          </div>
          <nav>
            <button className={tab === "profile" ? "on" : ""} onClick={() => router.push("/account")}>Profile</button>
            <button className={tab === "orders" ? "on" : ""} onClick={() => router.push("/account?tab=orders")}>
              <span>Orders</span><span className="cnt">{orders?.length ?? "·"}</span>
            </button>
            <button className="signout" onClick={() => { signOut(); router.push("/"); }}>
              <span style={{ display: "flex", gap: 8, alignItems: "center" }}><LogOut style={{ width: 16, height: 16 }} /> Sign out</span>
            </button>
          </nav>
        </aside>

        <div className="acct-main">
          {tab === "profile" ? (
            <div className="panel">
              <div className="panel-head"><h2>Profile</h2><button className="btn btn-primary" onClick={() => toast("Profile saved.")}>Save changes</button></div>
              <div className="field-row">
                <div className="field"><label>Company / kitchen</label><input defaultValue={displayName} /></div>
                <div className="field"><label>Email</label><input defaultValue={user.email} disabled /></div>
              </div>
              <p className="note">Contract pricing and multi-unit billing are set up by your account manager — <Link href="/contact" style={{ color: "var(--red)", fontWeight: 600 }}>get in touch</Link>.</p>
            </div>
          ) : (
            <div className="panel">
              <div className="panel-head"><h2>Orders</h2></div>
              {orders === null ? (
                <div>{[0, 1, 2].map((i) => <div key={i} className="skel skel-order" />)}</div>
              ) : orders.length === 0 ? (
                <div className="emptybox">
                  <Package />
                  <div className="m">No orders yet</div>
                  <div className="s">Orders you place will appear here with live status.</div>
                  <Link className="btn btn-primary" href="/products">Start shopping</Link>
                </div>
              ) : (
                orders.map((o) => (
                  <div className="order" key={o.id}>
                    <div className="oh">
                      <span>#{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleDateString()}</span>
                      <span className={`ostatus ${o.status}`}>{o.status}</span>
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
