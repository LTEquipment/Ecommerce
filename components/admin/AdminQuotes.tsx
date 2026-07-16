"use client";

import { useCallback, useEffect, useState } from "react";
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
  quote_request_items: QuoteItem[];
};

const STATUSES = ["new", "quoted", "won", "lost"] as const;

export default function AdminQuotes() {
  const { toast } = useStore();
  const [rows, setRows] = useState<Quote[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

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
        <div className="admin-cards">
          {rows.map((q) => (
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
  );
}
