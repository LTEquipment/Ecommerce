"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "../StoreProvider";
import { useAuth } from "../AuthProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { logAudit } from "@/lib/audit";
import { money } from "@/lib/format";
import { CARRIERS, trackingUrl } from "@/lib/tracking";
import { Package, ChevronDown } from "../icons";

type Item = { sku: string | null; name: string; unit_price: number; qty: number };
type Order = {
  id: string;
  created_at: string;
  status: string;
  subtotal: number;
  freight: number;
  total: number;
  customer_id: string | null;
  carrier?: string | null;
  tracking_number?: string | null;
  order_items?: Item[];
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
  const [people, setPeople] = useState<Record<string, { email: string; company: string }>>({});
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    // Select * so newly-migrated columns (payment_*, carrier, tracking) load
    // when present without breaking before the migration is run.
    const { data } = await sb
      .from("orders")
      .select("*, order_items(sku, name, unit_price, qty)")
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    // Customer names/emails come from the service-key API (auth.users isn't readable via RLS).
    fetch("/api/admin/customers").then((r) => r.json()).then((j) => {
      const map: Record<string, { email: string; company: string }> = {};
      (j.customers ?? []).forEach((c: { id: string; email: string; company: string }) => { map[c.id] = { email: c.email, company: c.company }; });
      setPeople(map);
    }).catch(() => {});
  }, []);

  const setStatus = async (id: string, status: string) => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    setOrders((prev) => prev?.map((o) => (o.id === id ? { ...o, status } : o)) ?? prev);
    const { error } = await sb.from("orders").update({ status }).eq("id", id);
    if (error) { toast(error.message); load(); return; }
    logAudit(user, "order.status", `#${id.slice(0, 8)}`, `→ ${status}`);
    toast(`Order #${id.slice(0, 8)} → ${status}`);
  };

  const editTrack = (id: string, field: "carrier" | "tracking_number", value: string) => {
    setOrders((prev) => prev?.map((o) => (o.id === id ? { ...o, [field]: value } : o)) ?? prev);
  };

  const saveTracking = async (o: Order) => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { error } = await sb
      .from("orders")
      .update({ carrier: o.carrier || null, tracking_number: o.tracking_number || null, shipped_at: new Date().toISOString() })
      .eq("id", o.id);
    if (error) { toast(error.message); return; }
    logAudit(user, "order.tracking", `#${o.id.slice(0, 8)}`, `${o.carrier ?? ""} ${o.tracking_number ?? ""}`.trim());
    toast(`Tracking saved for #${o.id.slice(0, 8)}`);
  };

  const who = (o: Order) => (o.customer_id ? people[o.customer_id] : undefined);

  if (orders === null) return <div>{[0, 1, 2].map((i) => <div key={i} className="skel skel-row" />)}</div>;

  return (
    <>
      {orders.length === 0 ? (
        <div className="emptybox"><Package /><div className="m">No orders yet</div><div className="s">Orders placed on the storefront appear here.</div></div>
      ) : (
        <div className="admin-cards">
          {orders.map((o) => {
            const items = o.order_items ?? [];
            const isOpen = open === o.id;
            const c = who(o);
            const subtotal = Number(o.subtotal) || items.reduce((s, it) => s + Number(it.unit_price) * it.qty, 0);
            return (
              <div className={`ord-card${isOpen ? " open" : ""}`} key={o.id}>
                <button className="ord-summary" onClick={() => setOpen(isOpen ? null : o.id)} aria-expanded={isOpen}>
                  <ChevronDown className="ord-caret" />
                  <div className="ac-main">
                    <div className="ac-title">#{o.id.slice(0, 8)} <span className="ac-date">{new Date(o.created_at).toLocaleDateString()}</span></div>
                    <div className="ac-sub">{c ? (c.company || c.email) : "Guest"} · {items.reduce((n, it) => n + it.qty, 0)} item{items.reduce((n, it) => n + it.qty, 0) === 1 ? "" : "s"}</div>
                  </div>
                  <div className="ac-total">{money(Number(o.total))}</div>
                  <span className={`pill ${tone(o.status)}`}>{o.status}</span>
                </button>

                {isOpen && (
                  <div className="ord-detail">
                    <div className="ord-lines">
                      {items.length === 0 ? <div className="ord-empty">No line items recorded.</div> : items.map((it, i) => (
                        <div className="ord-line" key={i}>
                          <div className="ord-line-name"><b>{it.name}</b>{it.sku ? <span>SKU {it.sku}</span> : null}</div>
                          <div className="ord-line-qty">{it.qty} × {money(Number(it.unit_price))}</div>
                          <div className="ord-line-tot">{money(Number(it.unit_price) * it.qty)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="ord-totals">
                      <div><span>Subtotal</span><b>{money(subtotal)}</b></div>
                      <div><span>Freight</span><b>{Number(o.freight) ? money(Number(o.freight)) : "—"}</b></div>
                      <div className="ord-grand"><span>Total</span><b>{money(Number(o.total))}</b></div>
                    </div>
                    <div className="ord-foot">
                      <div className="ord-cust">
                        {c ? <><b>{c.company || "—"}</b><span>{c.email}</span></> : <span>Guest checkout</span>}
                      </div>
                      <label className="ord-status-edit">Status
                        <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} aria-label="Order status">
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </label>
                    </div>
                    {(o.status === "shipped" || o.status === "delivered" || o.carrier || o.tracking_number) && (
                      <div className="ord-track">
                        <label>Carrier
                          <select value={o.carrier ?? ""} onChange={(e) => editTrack(o.id, "carrier", e.target.value)}>
                            <option value="">—</option>
                            {CARRIERS.map((cr) => <option key={cr} value={cr}>{cr}</option>)}
                          </select>
                        </label>
                        <label>Tracking #
                          <input value={o.tracking_number ?? ""} onChange={(e) => editTrack(o.id, "tracking_number", e.target.value)} placeholder="Tracking number" />
                        </label>
                        <button className="btn btn-line" onClick={() => saveTracking(o)}>Save tracking</button>
                        {trackingUrl(o.carrier, o.tracking_number) && (
                          <a className="ord-track-link" href={trackingUrl(o.carrier, o.tracking_number)!} target="_blank" rel="noreferrer">Track →</a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
