"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "../StoreProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { money } from "@/lib/format";
import { Search, User, ChevronDown } from "../icons";

type Customer = {
  id: string; email: string; company: string; role: string;
  dealerStatus: string | null; createdAt: string; lastSignInAt: string | null;
  confirmed: boolean; isAdmin: boolean;
};
type Order = { id: string; created_at: string; status: string; total: number };
type Claim = { id: string; created_at: string; model: string | null; status: string };
type Ticket = { id: string; created_at: string; subject: string | null; status: string };
type Detail = { orders: Order[]; claims: Claim[]; tickets: Ticket[] } | "loading";

export default function AdminCustomers() {
  const { toast } = useStore();
  const [list, setList] = useState<Customer[] | null>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, Detail>>({});

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/customers");
    const json = await res.json().catch(() => ({}));
    if (!res.ok) { toast(json.error || "Failed to load customers", "error"); setList([]); return; }
    setList(json.customers ?? []);
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  // Confirm the high-impact, hard-to-undo actions before firing.
  const CONFIRM: Record<string, (c: Customer) => string> = {
    "grant-admin": (c) => `Grant full admin console access to ${c.email}?`,
    "revoke-admin": (c) => `Revoke admin access from ${c.email}?`,
    "reject-dealer": (c) => `Reject the trade-account request from ${c.email}?`,
  };

  const act = async (c: Customer, action: string) => {
    const confirmMsg = CONFIRM[action]?.(c);
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(c.id + action);
    const res = await fetch("/api/admin/customers", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: c.id, action }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return toast(json.error || "Action failed", "error");
    toast("Updated.");
    load();
  };

  const toggle = async (c: Customer) => {
    if (open === c.id) { setOpen(null); return; }
    setOpen(c.id);
    if (details[c.id]) return;
    const sb = getBrowserSupabase();
    if (!sb) return; // null-check before the loading flag so the row never sticks on the skeleton
    setDetails((d) => ({ ...d, [c.id]: "loading" }));
    const [{ data: orders }, { data: claims }, { data: tickets }] = await Promise.all([
      sb.from("orders").select("id, created_at, status, total").eq("customer_id", c.id).order("created_at", { ascending: false }),
      sb.from("warranty_claims").select("id, created_at, model, status").eq("user_id", c.id).order("created_at", { ascending: false }),
      sb.from("service_tickets").select("id, created_at, subject, status").eq("user_id", c.id).order("created_at", { ascending: false }),
    ]);
    setDetails((d) => ({ ...d, [c.id]: { orders: (orders as Order[]) ?? [], claims: (claims as Claim[]) ?? [], tickets: (tickets as Ticket[]) ?? [] } }));
  };

  const filtered = useMemo(() => {
    if (!list) return null;
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((c) => c.email.toLowerCase().includes(s) || c.company.toLowerCase().includes(s));
  }, [list, q]);

  return (
    <>
      <div className="admin-sec-head">
        <span className="admin-sub" style={{ margin: 0 }}>{list?.length ?? "·"} total</span>
        <span className="admin-search"><Search /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email or company…" aria-label="Search customers" /></span>
      </div>

      {filtered === null ? <div className="skel skel-row" /> : filtered.length === 0 ? (
        <div className="emptybox"><User /><div className="m">No customers{q ? " match" : " yet"}</div></div>
      ) : (
        <div className="cust-table">
          <div className="cust-thead"><span></span><span>Customer</span><span>Type</span><span>Joined</span><span>Last active</span><span>Actions</span></div>
          {filtered.map((c) => {
            const d = details[c.id];
            const isOpen = open === c.id;
            return (
              <div className={`cust-item${isOpen ? " open" : ""}`} key={c.id}>
                <div className="cust-row" onClick={() => toggle(c)} role="button" tabIndex={0} aria-expanded={isOpen} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(c); } }}>
                  <ChevronDown className="cust-caret" />
                  <div className="cust-who">
                    <span className="cust-ava">{(c.company || c.email || "?")[0]?.toUpperCase()}</span>
                    <div style={{ minWidth: 0 }}>
                      <b>{c.email}{c.isAdmin && <em className="cust-badge">Admin</em>}{!c.confirmed && <em className="cust-badge mut">Unconfirmed</em>}</b>
                      <span>{c.company || "—"}</span>
                    </div>
                  </div>
                  <div className="cust-type">
                    {c.role === "dealer" ? (
                      <span className={`pill ${c.dealerStatus === "approved" ? "ok" : c.dealerStatus === "pending" ? "warn" : "mut"}`}>
                        {c.dealerStatus === "approved" ? "Dealer" : c.dealerStatus === "pending" ? "Trade · pending" : c.dealerStatus === "rejected" ? "Trade · rejected" : "Dealer"}
                      </span>
                    ) : <span className="pill info">Customer</span>}
                  </div>
                  <div className="cust-date" data-label="Joined">{new Date(c.createdAt).toLocaleDateString()}</div>
                  <div className="cust-date" data-label="Last active">{c.lastSignInAt ? new Date(c.lastSignInAt).toLocaleDateString() : "—"}</div>
                  <div className="cust-actions" onClick={(e) => e.stopPropagation()}>
                    {c.dealerStatus === "pending" && (
                      <>
                        <button className="btn btn-primary btn-xs" disabled={busy === c.id + "approve-dealer"} onClick={() => act(c, "approve-dealer")}>Approve</button>
                        <button className="btn btn-line btn-xs" disabled={busy === c.id + "reject-dealer"} onClick={() => act(c, "reject-dealer")}>Reject</button>
                      </>
                    )}
                    {c.isAdmin ? (
                      <button className="btn btn-line btn-xs" disabled={busy === c.id + "revoke-admin"} onClick={() => act(c, "revoke-admin")}>Revoke admin</button>
                    ) : (
                      <button className="btn btn-line btn-xs" disabled={busy === c.id + "grant-admin"} onClick={() => act(c, "grant-admin")}>Make admin</button>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div className="cust-detail">
                    {d === "loading" || !d ? <div className="skel skel-row" /> : (
                      <div className="cust-detail-grid">
                        <div className="cust-panel">
                          <h4>Orders <span>{d.orders.length}</span></h4>
                          {d.orders.length === 0 ? <p className="cust-none">No orders.</p> : d.orders.map((o) => (
                            <div className="cust-mini" key={o.id}><span>#{o.id.slice(0, 8)}</span><em>{new Date(o.created_at).toLocaleDateString()}</em><span className={`pill ${o.status === "delivered" ? "ok" : o.status === "cancelled" ? "mut" : "warn"}`}>{o.status}</span><b>{money(Number(o.total))}</b></div>
                          ))}
                        </div>
                        <div className="cust-panel">
                          <h4>Warranty claims <span>{d.claims.length}</span></h4>
                          {d.claims.length === 0 ? <p className="cust-none">No claims.</p> : d.claims.map((cl) => (
                            <div className="cust-mini" key={cl.id}><span>{cl.model || "Claim"}</span><em>{new Date(cl.created_at).toLocaleDateString()}</em><span className="pill info">{cl.status.replace(/_/g, " ")}</span></div>
                          ))}
                        </div>
                        <div className="cust-panel">
                          <h4>Service tickets <span>{d.tickets.length}</span></h4>
                          {d.tickets.length === 0 ? <p className="cust-none">No tickets.</p> : d.tickets.map((t) => (
                            <div className="cust-mini" key={t.id}><span>{t.subject || "Ticket"}</span><em>{new Date(t.created_at).toLocaleDateString()}</em><span className="pill info">{t.status.replace(/_/g, " ")}</span></div>
                          ))}
                        </div>
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
