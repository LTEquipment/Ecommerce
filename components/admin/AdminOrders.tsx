"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "../StoreProvider";
import { useAuth } from "../AuthProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { logAudit } from "@/lib/audit";
import { money } from "@/lib/format";
import { Package } from "../icons";

type Order = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  order_items?: { name: string; qty: number }[];
};

const STATUSES = ["submitted", "processing", "shipped", "delivered", "cancelled"];
function tone(s: string) {
  if (["delivered", "shipped"].includes(s)) return "ok";
  if (["processing", "submitted"].includes(s)) return "warn";
  if (s === "cancelled") return "mut";
  return "info";
}

export default function AdminOrders() {
  const { toast } = useStore();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  const load = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { data } = await sb
      .from("orders")
      .select("id, created_at, status, total, order_items(name, qty)")
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: string, status: string) => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    setOrders((prev) => prev?.map((o) => (o.id === id ? { ...o, status } : o)) ?? prev);
    const { error } = await sb.from("orders").update({ status }).eq("id", id);
    if (error) { toast(error.message); load(); return; }
    logAudit(user, "order.status", `#${id.slice(0, 8)}`, `→ ${status}`);
    toast(`Order #${id.slice(0, 8)} → ${status}`);
  };

  if (orders === null) return <div>{[0, 1, 2].map((i) => <div key={i} className="skel skel-row" />)}</div>;

  return (
    <>
      {orders.length === 0 ? (
        <div className="emptybox"><Package /><div className="m">No orders yet</div><div className="s">Orders placed on the storefront appear here.</div></div>
      ) : (
        <div className="admin-cards">
          {orders.map((o) => (
            <div className="admin-card" key={o.id}>
              <div className="ac-main">
                <div className="ac-title">#{o.id.slice(0, 8)} <span className="ac-date">{new Date(o.created_at).toLocaleDateString()}</span></div>
                <div className="ac-sub">{(o.order_items ?? []).map((it) => `${it.qty}× ${it.name}`).join("  ·  ") || "—"}</div>
              </div>
              <div className="ac-total">{money(Number(o.total))}</div>
              <div className="ac-status">
                <span className={`pill ${tone(o.status)}`}>{o.status}</span>
                <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} aria-label="Order status">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
