"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "../StoreProvider";
import { useAuth } from "../AuthProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { logAudit } from "@/lib/audit";
import { useBulkSelect } from "@/lib/useBulkSelect";
import BulkBar from "./BulkBar";
import { money } from "@/lib/format";
import { toCsv } from "@/lib/csv";
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
  shipped_at?: string | null;
  po_number?: string | null;
  tax_exempt?: boolean;
  resale_cert?: string | null;
  payment_status?: string | null;
  amount_paid?: number | null;
  guest_email?: string | null;
  ship_name?: string | null;
  ship_company?: string | null;
  ship_phone?: string | null;
  ship_address?: string | null;
  ship_city?: string | null;
  ship_state?: string | null;
  ship_zip?: string | null;
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

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

  // Record an offline (wire / PO / check) payment — the storefront's real money
  // path. Sets payment_status='paid' with the full total; degrades with a clear
  // message if the payments migration isn't applied.
  const markPaid = async (o: Order) => {
    if (!window.confirm(`Mark order #${o.id.slice(0, 8)} as PAID (${money(Number(o.total))})? Do this once payment has cleared.`)) return;
    const sb = getBrowserSupabase();
    if (!sb) return;
    setOrders((prev) => prev?.map((x) => (x.id === o.id ? { ...x, payment_status: "paid", amount_paid: Number(o.total) } : x)) ?? prev);
    const { error } = await sb.from("orders").update({ payment_status: "paid", amount_paid: Number(o.total), paid_at: new Date().toISOString() }).eq("id", o.id);
    if (error) {
      toast(/payment_|amount_paid|paid_at|column/.test(error.message) ? "Enable the payments migration to record payment." : error.message, "error");
      load();
      return;
    }
    logAudit(user, "order.paid", `#${o.id.slice(0, 8)}`, `Marked paid · ${money(Number(o.total))}`);
    toast(`Order #${o.id.slice(0, 8)} marked paid`);
  };

  const setStatus = async (id: string, status: string) => {
    if (status === "cancelled" && !window.confirm(`Cancel order #${id.slice(0, 8)}? It will be marked cancelled.`)) return;
    const sb = getBrowserSupabase();
    if (!sb) return;
    setOrders((prev) => prev?.map((o) => (o.id === id ? { ...o, status } : o)) ?? prev);
    const { error } = await sb.from("orders").update({ status }).eq("id", id);
    if (error) { toast(error.message, "error"); load(); return; }
    logAudit(user, "order.status", `#${id.slice(0, 8)}`, `→ ${status}`);
    toast(`Order #${id.slice(0, 8)} → ${status}`);
  };

  const editTrack = (id: string, field: "carrier" | "tracking_number", value: string) => {
    setOrders((prev) => prev?.map((o) => (o.id === id ? { ...o, [field]: value } : o)) ?? prev);
  };

  const saveTracking = async (o: Order) => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    // Only stamp shipped_at the first time (correcting a typo later must not reset
    // the ship date), and auto-advance an un-shipped order to 'shipped'.
    const advance = o.status === "submitted" || o.status === "processing";
    const patch: Record<string, unknown> = {
      carrier: o.carrier || null,
      tracking_number: o.tracking_number || null,
    };
    if (!o.shipped_at) patch.shipped_at = new Date().toISOString();
    if (advance) patch.status = "shipped";
    const { error } = await sb.from("orders").update(patch).eq("id", o.id);
    if (error) { toast(error.message, "error"); load(); return; }
    setOrders((prev) => prev?.map((x) => (x.id === o.id
      ? { ...x, status: advance ? "shipped" : x.status, shipped_at: x.shipped_at ?? (patch.shipped_at as string | undefined) ?? null }
      : x)) ?? prev);
    logAudit(user, "order.tracking", `#${o.id.slice(0, 8)}`, `${o.carrier ?? ""} ${o.tracking_number ?? ""}`.trim());
    toast(`Tracking saved for #${o.id.slice(0, 8)}${advance ? " · marked shipped" : ""}`);
  };

  const who = (o: Order) => (o.customer_id ? people[o.customer_id] : undefined);

  const filtered = useMemo(() => {
    if (!orders) return [];
    const query = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!query) return true;
      const c = o.customer_id ? people[o.customer_id] : undefined;
      return (
        o.id.toLowerCase().includes(query) ||
        (c?.company ?? "").toLowerCase().includes(query) ||
        (c?.email ?? "").toLowerCase().includes(query)
      );
    });
  }, [orders, statusFilter, q, people]);

  useEffect(() => { setPage(0); }, [statusFilter, q]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount - 1);
  const paged = filtered.slice(pageSafe * PAGE_SIZE, pageSafe * PAGE_SIZE + PAGE_SIZE);

  const sel = useBulkSelect(paged.map((o) => o.id));
  const [bulkBusy, setBulkBusy] = useState(false);

  /** Apply one status to every selected order. Sequential on purpose: the audit
   *  log should carry one entry per order, and a partial failure must stop
   *  rather than silently leave the rest unchanged. */
  const bulkStatus = async (status: string) => {
    const ids = [...sel.ids];
    if (ids.length === 0) return;
    const verb = status === "cancelled" ? "Cancel" : `Mark ${status}`;
    if (!window.confirm(`${verb} ${ids.length} order${ids.length === 1 ? "" : "s"}?`)) return;
    const sb = getBrowserSupabase();
    if (!sb) return;
    setBulkBusy(true);
    let done = 0;
    for (const id of ids) {
      const { error } = await sb.from("orders").update({ status }).eq("id", id);
      if (error) {
        toast(`Stopped after ${done}: ${error.message}`, "error");
        break;
      }
      done++;
      logAudit(user, "order.status", `#${id.slice(0, 8)}`, `→ ${status} (bulk)`);
    }
    if (done > 0) {
      const applied = new Set(ids.slice(0, done));
      setOrders((prev) => prev?.map((o) => (applied.has(o.id) ? { ...o, status } : o)) ?? prev);
      toast(`${done} order${done === 1 ? "" : "s"} → ${status}`);
    }
    setBulkBusy(false);
    sel.clear();
  };

  const exportCsv = () => {
    const head = ["Order", "Date", "Status", "Customer", "Email", "Ship to", "SKU", "Item", "Qty", "Unit price", "Order total"];
    const rows: string[][] = [head];
    for (const o of filtered) {
      const c = o.customer_id ? people[o.customer_id] : undefined;
      const date = new Date(o.created_at).toISOString().slice(0, 10);
      const shipTo = [o.ship_name, o.ship_company, o.ship_address, [o.ship_city, o.ship_state].filter(Boolean).join(", "), o.ship_zip, o.ship_phone]
        .filter(Boolean).join(" / ");
      const base = [o.id.slice(0, 8), date, o.status, c?.company ?? "", c?.email ?? "", shipTo];
      const items = o.order_items ?? [];
      if (items.length === 0) rows.push([...base, "", "", "", "", String(o.total)]);
      // Order total only on the first line so summing the column doesn't multiply revenue.
      items.forEach((it, idx) => rows.push([...base, it.sku ?? "", it.name, String(it.qty), String(it.unit_price), idx === 0 ? String(o.total) : ""]));
    }
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (orders === null) return <div>{[0, 1, 2].map((i) => <div key={i} className="skel skel-row" />)}</div>;

  return (
    <>
      {orders.length === 0 ? (
        <div className="emptybox"><Package /><div className="m">No orders yet</div><div className="s">Orders placed on the storefront appear here.</div></div>
      ) : (
        <>
        <div className="ord-toolbar">
          <div className="ord-filters">
            {["all", ...STATUSES].map((s) => (
              <button key={s} className={`ord-chip${statusFilter === s ? " on" : ""}`} onClick={() => setStatusFilter(s)}>{s}</button>
            ))}
          </div>
          <input className="ord-search" placeholder="Search order, company, email…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search orders" />
          <button className="btn btn-line ord-export" onClick={exportCsv}>Export CSV</button>
        </div>
        {filtered.length === 0 ? (
          <div className="emptybox"><Package /><div className="m">No orders match</div><div className="s">Try a different status or search term.</div></div>
        ) : (
        <>
        <label className="ord-selectall">
          <input
            type="checkbox"
            checked={sel.allOnPage}
            ref={(el) => { if (el) el.indeterminate = sel.someOnPage; }}
            onChange={sel.toggleAll}
            aria-label="Select all orders on this page"
          />
          Select all on this page
        </label>
        <div className="admin-cards">
          {paged.map((o) => {
            const items = o.order_items ?? [];
            const isOpen = open === o.id;
            const c = who(o);
            const subtotal = Number(o.subtotal) || items.reduce((s, it) => s + Number(it.unit_price) * it.qty, 0);
            return (
              <div className={`ord-card${isOpen ? " open" : ""}${sel.has(o.id) ? " picked" : ""}`} key={o.id}>
                <label className="ord-pick" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={sel.has(o.id)}
                    onChange={() => sel.toggle(o.id)}
                    aria-label={`Select order #${o.id.slice(0, 8)}`}
                  />
                </label>
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
                      {(() => {
                        // Tax is folded into total (no tax column) — surface it so
                        // Subtotal + Freight + Tax reconciles to Total.
                        const tax = Number(o.total) - subtotal - (Number(o.freight) || 0);
                        return tax > 0.005 ? <div><span>Tax</span><b>{money(tax)}</b></div> : null;
                      })()}
                      <div className="ord-grand"><span>Total</span><b>{money(Number(o.total))}</b></div>
                      <div className="ord-pay">
                        <span>Payment</span>
                        {o.payment_status === "paid" ? (
                          <b className="ord-paid">Paid{o.amount_paid ? ` · ${money(Number(o.amount_paid))}` : ""}</b>
                        ) : o.status === "cancelled" ? (
                          <b className="ord-pay-mut">—</b>
                        ) : (
                          <button className="btn btn-line btn-xs" onClick={() => markPaid(o)}>Mark paid</button>
                        )}
                      </div>
                    </div>
                    {(o.po_number || o.tax_exempt || (o.guest_email && !o.customer_id)) && (
                      <div className="ord-b2b">
                        {o.po_number && <span>PO <b>{o.po_number}</b></span>}
                        {o.tax_exempt && <span className="ord-exempt">Tax-exempt{o.resale_cert ? ` · cert ${o.resale_cert}` : " · unverified"}</span>}
                        {o.guest_email && !o.customer_id && <span>Guest · <a href={`mailto:${o.guest_email}`}>{o.guest_email}</a></span>}
                      </div>
                    )}
                    {(o.ship_name || o.ship_address) && (
                      <div className="ord-ship">
                        <div className="ord-ship-h">Ship to</div>
                        <div className="ord-ship-body">
                          {o.ship_name && <div>{o.ship_name}{o.ship_company ? ` · ${o.ship_company}` : ""}</div>}
                          {o.ship_address && <div>{o.ship_address}</div>}
                          {(o.ship_city || o.ship_state || o.ship_zip) && <div>{[o.ship_city, o.ship_state].filter(Boolean).join(", ")} {o.ship_zip}</div>}
                          {o.ship_phone && <div>{o.ship_phone}</div>}
                        </div>
                      </div>
                    )}
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
        {pageCount > 1 && (
          <div className="admin-pager">
            <button className="btn btn-line btn-sm" disabled={pageSafe === 0} onClick={() => setPage(pageSafe - 1)}>Prev</button>
            <span>Page {pageSafe + 1} of {pageCount} · {filtered.length} orders</span>
            <button className="btn btn-line btn-sm" disabled={pageSafe >= pageCount - 1} onClick={() => setPage(pageSafe + 1)}>Next</button>
          </div>
        )}
        <BulkBar count={sel.count} noun="order" onClear={sel.clear} busy={bulkBusy}>
          <button type="button" className="btn btn-line btn-sm" disabled={bulkBusy} onClick={() => bulkStatus("processing")}>Processing</button>
          <button type="button" className="btn btn-line btn-sm" disabled={bulkBusy} onClick={() => bulkStatus("shipped")}>Shipped</button>
          <button type="button" className="btn btn-line btn-sm" disabled={bulkBusy} onClick={() => bulkStatus("delivered")}>Delivered</button>
          <button type="button" className="btn btn-line btn-sm danger" disabled={bulkBusy} onClick={() => bulkStatus("cancelled")}>Cancel</button>
        </BulkBar>

        </>
        )}
        </>
      )}
    </>
  );
}
