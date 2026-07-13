"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "../StoreProvider";
import { useAuth } from "../AuthProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { logAudit } from "@/lib/audit";
import { Shield, Chat } from "../icons";

type Claim = { id: string; created_at: string; model: string | null; sku: string | null; issue: string | null; status: string };
type Ticket = { id: string; created_at: string; subject: string | null; message: string | null; status: string };

const CLAIM_STATUS = ["submitted", "in_review", "approved", "resolved", "rejected"];
const TICKET_STATUS = ["open", "in_progress", "resolved", "closed"];
function tone(s: string) {
  if (["approved", "resolved"].includes(s)) return "ok";
  if (["in_review", "in_progress"].includes(s)) return "warn";
  if (["rejected", "closed"].includes(s)) return "mut";
  return "info";
}
const pretty = (s: string) => s.replace(/_/g, " ");

export default function AdminService() {
  const { toast } = useStore();
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[] | null>(null);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);

  const load = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    sb.from("warranty_claims").select("id,created_at,model,sku,issue,status").order("created_at", { ascending: false }).then(({ data }) => setClaims((data as Claim[]) ?? []));
    sb.from("service_tickets").select("id,created_at,subject,message,status").order("created_at", { ascending: false }).then(({ data }) => setTickets((data as Ticket[]) ?? []));
  }, []);
  useEffect(() => { load(); }, [load]);

  const update = async (table: "warranty_claims" | "service_tickets", id: string, status: string) => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    if (table === "warranty_claims") setClaims((p) => p?.map((c) => (c.id === id ? { ...c, status } : c)) ?? p);
    else setTickets((p) => p?.map((t) => (t.id === id ? { ...t, status } : t)) ?? p);
    const { error } = await sb.from(table).update({ status }).eq("id", id);
    if (error) { toast(error.message); load(); return; }
    logAudit(user, table === "warranty_claims" ? "claim.status" : "ticket.status", `#${id.slice(0, 8)}`, `→ ${pretty(status)}`);
    toast(`Updated → ${pretty(status)}`);
  };

  return (
    <>
      <div className="admin-sec-head"><h2 className="admin-h">Warranty claims <span className="admin-count">{claims?.length ?? "·"}</span></h2></div>
      {claims === null ? <div className="skel skel-row" /> : claims.length === 0 ? (
        <div className="emptybox"><Shield /><div className="m">No warranty claims</div></div>
      ) : (
        <div className="admin-cards">
          {claims.map((c) => (
            <div className="admin-card" key={c.id}>
              <div className="ac-main">
                <div className="ac-title">{c.model || "Warranty claim"} <span className="ac-date">{new Date(c.created_at).toLocaleDateString()}</span></div>
                <div className="ac-sub">{c.sku ? `SKU ${c.sku} — ` : ""}{c.issue || "—"}</div>
              </div>
              <div className="ac-status">
                <span className={`pill ${tone(c.status)}`}>{pretty(c.status)}</span>
                <select value={c.status} onChange={(e) => update("warranty_claims", c.id, e.target.value)} aria-label="Claim status">
                  {CLAIM_STATUS.map((s) => <option key={s} value={s}>{pretty(s)}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-sec-head" style={{ marginTop: "var(--s6)" }}><h2 className="admin-h">Service tickets <span className="admin-count">{tickets?.length ?? "·"}</span></h2></div>
      {tickets === null ? <div className="skel skel-row" /> : tickets.length === 0 ? (
        <div className="emptybox"><Chat /><div className="m">No service tickets</div></div>
      ) : (
        <div className="admin-cards">
          {tickets.map((t) => (
            <div className="admin-card" key={t.id}>
              <div className="ac-main">
                <div className="ac-title">{t.subject || "Service ticket"} <span className="ac-date">{new Date(t.created_at).toLocaleDateString()}</span></div>
                <div className="ac-sub">{t.message || "—"}</div>
              </div>
              <div className="ac-status">
                <span className={`pill ${tone(t.status)}`}>{pretty(t.status)}</span>
                <select value={t.status} onChange={(e) => update("service_tickets", t.id, e.target.value)} aria-label="Ticket status">
                  {TICKET_STATUS.map((s) => <option key={s} value={s}>{pretty(s)}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
