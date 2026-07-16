"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { Mail } from "../icons";

type Msg = { id: string; created_at: string; name: string | null; company: string | null; email: string | null; phone: string | null; message: string | null };
type Sub = { email: string; created_at: string };
type StockReq = { id: string; product_slug: string; sku: string | null; email: string | null; created_at: string };

export default function AdminInbox() {
  const [msgs, setMsgs] = useState<Msg[] | null>(null);
  const [subs, setSubs] = useState<Sub[] | null>(null);
  const [stock, setStock] = useState<StockReq[] | null>(null);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    sb.from("contact_messages").select("id,created_at,name,company,email,phone,message").order("created_at", { ascending: false }).then(({ data }) => setMsgs((data as Msg[]) ?? []));
    sb.from("subscribers").select("email,created_at").order("created_at", { ascending: false }).then(({ data }) => setSubs((data as Sub[]) ?? []));
    sb.from("stock_notifications").select("id,product_slug,sku,email,created_at").eq("notified", false).order("created_at", { ascending: false }).then(({ data }) => setStock((data as StockReq[]) ?? []));
  }, []);

  return (
    <>
      <div className="admin-sec-head"><h2 className="admin-h">Messages <span className="admin-count">{msgs?.length ?? "·"}</span></h2></div>
      {msgs === null ? <div className="skel skel-row" /> : msgs.length === 0 ? (
        <div className="emptybox"><Mail /><div className="m">No messages</div><div className="s">Contact-form submissions land here.</div></div>
      ) : (
        <div className="admin-cards">
          {msgs.map((m) => (
            <div className="admin-card msg-card" key={m.id}>
              <div className="ac-main">
                <div className="ac-title">{m.name || "Someone"}{m.company ? ` · ${m.company}` : ""} <span className="ac-date">{new Date(m.created_at).toLocaleDateString()}</span></div>
                <div className="ac-contact">
                  {m.email && <a href={`mailto:${m.email}`}>{m.email}</a>}
                  {m.phone && <a href={`tel:${m.phone.replace(/\D/g, "")}`}>{m.phone}</a>}
                </div>
                <div className="ac-sub ac-msg">{m.message || "—"}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-sec-head" style={{ marginTop: "var(--s6)" }}><h2 className="admin-h">Back-in-stock alerts <span className="admin-count">{stock?.length ?? "·"}</span></h2></div>
      {stock === null ? <div className="skel skel-row" /> : stock.length === 0 ? (
        <div className="emptybox"><Mail /><div className="m">No pending alerts</div><div className="s">Requests to be notified when a backordered item returns land here.</div></div>
      ) : (
        <div className="sub-list">
          {stock.map((s) => (
            <div className="sub-row" key={s.id}>
              <span><b>{s.sku || s.product_slug}</b> · <a href={`mailto:${s.email}`}>{s.email}</a></span>
              <span>{new Date(s.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      <div className="admin-sec-head" style={{ marginTop: "var(--s6)" }}><h2 className="admin-h">Subscribers <span className="admin-count">{subs?.length ?? "·"}</span></h2></div>
      {subs === null ? <div className="skel skel-row" /> : subs.length === 0 ? (
        <div className="emptybox"><Mail /><div className="m">No subscribers yet</div></div>
      ) : (
        <div className="sub-list">
          {subs.map((s) => (
            <div className="sub-row" key={s.email}>
              <a href={`mailto:${s.email}`}>{s.email}</a>
              <span>{new Date(s.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
