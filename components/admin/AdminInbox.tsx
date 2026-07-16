"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { useStore } from "../StoreProvider";
import { useAuth } from "../AuthProvider";
import { logAudit } from "@/lib/audit";
import { Mail } from "../icons";

type Msg = { id: string; created_at: string; name: string | null; company: string | null; email: string | null; phone: string | null; message: string | null; handled?: boolean };
type Sub = { email: string; created_at: string };
type StockReq = { id: string; product_slug: string; sku: string | null; email: string | null; created_at: string };

export default function AdminInbox() {
  const { toast } = useStore();
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Msg[] | null>(null);
  const [subs, setSubs] = useState<Sub[] | null>(null);
  const [stock, setStock] = useState<StockReq[] | null>(null);
  const [showHandled, setShowHandled] = useState(false);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) { setMsgs([]); setSubs([]); setStock([]); return; }
    // select * so 'handled' loads when present (before the triage migration it's absent).
    // Each loader has a reject handler so a failed query degrades to the empty state
    // instead of hanging on a perpetual skeleton.
    sb.from("contact_messages").select("*").order("created_at", { ascending: false }).then(({ data }) => setMsgs((data as Msg[]) ?? []), () => setMsgs([]));
    sb.from("subscribers").select("email,created_at").order("created_at", { ascending: false }).then(({ data }) => setSubs((data as Sub[]) ?? []), () => setSubs([]));
    sb.from("stock_notifications").select("id,product_slug,sku,email,created_at").eq("notified", false).order("created_at", { ascending: false }).then(({ data }) => setStock((data as StockReq[]) ?? []), () => setStock([]));
  }, []);

  const setHandled = async (id: string, handled: boolean) => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    setMsgs((prev) => prev?.map((m) => (m.id === id ? { ...m, handled } : m)) ?? prev);
    const { error } = await sb.from("contact_messages").update({ handled }).eq("id", id);
    if (error) {
      // revert the optimistic flip so the row doesn't silently un-persist on reload
      setMsgs((prev) => prev?.map((m) => (m.id === id ? { ...m, handled: !handled } : m)) ?? prev);
      return toast(error.message || "Couldn’t update the message — try again", "error");
    }
    logAudit(user, "contact.handled", `#${id.slice(0, 8)}`, handled ? "Marked handled" : "Reopened");
  };

  const markNotified = async (s: StockReq) => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    setStock((prev) => prev?.filter((x) => x.id !== s.id) ?? prev);
    const { error } = await sb.from("stock_notifications").update({ notified: true }).eq("id", s.id);
    if (error) {
      // put the row back if the write failed
      setStock((prev) => (prev ? [s, ...prev] : [s]));
      return toast(error.message || "Couldn’t clear the alert — try again", "error");
    }
    logAudit(user, "stock.notified", s.sku || s.product_slug, s.email || "");
    toast("Alert cleared");
  };

  const open = (msgs ?? []).filter((m) => !m.handled);
  const shown = showHandled ? (msgs ?? []) : open;

  return (
    <>
      <div className="admin-sec-head">
        <h2 className="admin-h">Messages <span className="admin-count">{open.length}</span></h2>
        {(msgs?.length ?? 0) > open.length && (
          <button className="inbox-toggle" onClick={() => setShowHandled((v) => !v)}>
            {showHandled ? "Hide handled" : `Show handled (${(msgs?.length ?? 0) - open.length})`}
          </button>
        )}
      </div>
      {msgs === null ? <div className="skel skel-row" /> : shown.length === 0 ? (
        <div className="emptybox"><Mail /><div className="m">{showHandled ? "No messages" : "Inbox zero"}</div><div className="s">Contact-form submissions land here.</div></div>
      ) : (
        <div className="admin-cards">
          {shown.map((m) => (
            <div className={`admin-card msg-card${m.handled ? " is-handled" : ""}`} key={m.id}>
              <div className="ac-main">
                <div className="ac-title">{m.name || "Someone"}{m.company ? ` · ${m.company}` : ""} <span className="ac-date">{new Date(m.created_at).toLocaleDateString()}</span></div>
                <div className="ac-contact">
                  {m.email && <a href={`mailto:${m.email}`}>{m.email}</a>}
                  {m.phone && <a href={`tel:${m.phone.replace(/\D/g, "")}`}>{m.phone}</a>}
                </div>
                <div className="ac-sub ac-msg">{m.message || "—"}</div>
              </div>
              <button className="msg-handle" onClick={() => setHandled(m.id, !m.handled)}>
                {m.handled ? "Reopen" : "Mark handled"}
              </button>
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
              <span className="sub-row-end">
                {new Date(s.created_at).toLocaleDateString()}
                <button className="inbox-toggle" onClick={() => markNotified(s)}>Mark notified</button>
              </span>
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
