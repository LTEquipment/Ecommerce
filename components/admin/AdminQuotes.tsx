"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "../StoreProvider";
import { FileText } from "../icons";
import { money } from "@/lib/format";

type QuoteItem = { sku: string | null; name: string; unit_price: number; qty: number };
type Quote = {
  id: string;
  created_at: string;
  name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  subtotal: number;
  status: string;
  converted_order_id?: string | null;
  quote_request_items: QuoteItem[];
};

const STATUSES = ["new", "quoted", "won", "lost"] as const;

export default function AdminQuotes() {
  const { toast } = useStore();
  const [rows, setRows] = useState<Quote[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/quotes", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setRows(d.quotes ?? []))
      .catch(() => setRows([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: string, status: string) => {
    setBusy(id);
    // optimistic status pill
    setRows((prev) => prev?.map((q) => (q.id === id ? { ...q, status } : q)) ?? prev);
    try {
      const res = await fetch("/api/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error(String(res.status));
      toast(`Marked ${status}`);
      load();
    } catch {
      toast("Couldn’t update the quote — try again", "error");
      load(); // resync the optimistic pill from the server
    } finally {
      setBusy(null);
    }
  };

  const convert = async (quote: Quote) => {
    const label = quote.company || quote.name || "this quote";
    if (!window.confirm(`Create an order from ${label}? It will enter the Orders pipeline at the quoted prices, and the quote will be marked won.`)) return;
    setBusy(quote.id);
    try {
      const res = await fetch("/api/admin/quotes/convert", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: quote.id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "");
      toast(json.already ? `Already converted — order #${String(json.orderId ?? "").slice(0, 8)}` : `Order #${String(json.orderId ?? "").slice(0, 8)} created`);
      load();
    } catch (e) {
      const m = (e as Error).message;
      toast(m ? `Couldn’t convert — ${m}` : "Couldn’t convert the quote — try again", "error");
    } finally {
      setBusy(null);
    }
  };

  const filtered = useMemo(() => {
    if (!rows) return [];
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!s) return true;
      return (r.company ?? "").toLowerCase().includes(s) || (r.name ?? "").toLowerCase().includes(s) || (r.email ?? "").toLowerCase().includes(s);
    });
  }, [rows, statusFilter, q]);

  return (
    <>
      <div className="admin-sec-head">
        <h2 className="admin-h">
          Quote requests <span className="admin-count">{rows?.length ?? "·"}</span>
        </h2>
      </div>
      {rows === null ? (
        <div className="skel skel-row" />
      ) : rows.length === 0 ? (
        <div className="emptybox">
          <FileText />
          <div className="m">No quote requests</div>
          <div className="s">Requests submitted from the cart land here.</div>
        </div>
      ) : (
        <>
        <div className="ord-toolbar">
          <div className="ord-filters">
            {["all", ...STATUSES].map((s) => (
              <button key={s} className={`ord-chip${statusFilter === s ? " on" : ""}`} onClick={() => setStatusFilter(s)}>{s}</button>
            ))}
          </div>
          <input className="ord-search" placeholder="Search company, name, email…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search quotes" />
        </div>
        {filtered.length === 0 ? (
          <div className="emptybox"><FileText /><div className="m">No quotes match</div><div className="s">Try a different status or search term.</div></div>
        ) : (
        <div className="admin-cards">
          {filtered.map((q) => (
            <div className="admin-card qr-admin" key={q.id}>
              <div className="ac-main">
                <div className="ac-title">
                  {q.company || q.name || "Someone"}
                  <span className={`qr-pill s-${q.status}`}>{q.status}</span>
                  <span className="ac-date">{new Date(q.created_at).toLocaleDateString()}</span>
                </div>
                <div className="ac-contact">
                  {q.name && q.company && <span>{q.name}</span>}
                  {q.email && <a href={`mailto:${q.email}`}>{q.email}</a>}
                  {q.phone && <a href={`tel:${q.phone.replace(/\D/g, "")}`}>{q.phone}</a>}
                </div>
                <div className="qr-admin-items">
                  {(q.quote_request_items ?? []).map((it, i) => (
                    <div key={i}>
                      <span>{it.qty} × {it.name}</span>
                      <span>{money(it.unit_price * it.qty)}</span>
                    </div>
                  ))}
                </div>
                {q.notes && <div className="ac-sub ac-msg">{q.notes}</div>}
                <div className="qr-admin-total">List subtotal: <b>{money(q.subtotal)}</b></div>
                {q.converted_order_id ? (
                  <span className="qr-converted">✓ Converted to order #{q.converted_order_id.slice(0, 8)}</span>
                ) : q.status !== "lost" && (
                  <button className="btn btn-line btn-sm qr-convert" disabled={busy === q.id} onClick={() => convert(q)}>
                    {busy === q.id ? "Working…" : "Create order from quote →"}
                  </button>
                )}
              </div>
              <div className="qr-admin-actions">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    className={`qr-status-btn${q.status === s ? " on" : ""}`}
                    disabled={busy === q.id}
                    onClick={() => setStatus(q.id, s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        )}
        </>
      )}
    </>
  );
}
