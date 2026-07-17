"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "../StoreProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { money } from "@/lib/format";
import { toCsv } from "@/lib/csv";
import { Search, User, ChevronDown } from "../icons";
import RowMenu from "./RowMenu";

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
  const [typeFilter, setTypeFilter] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, Detail>>({});

  const typeOf = (c: Customer) =>
    c.role === "dealer"
      ? c.dealerStatus === "approved" ? "Dealer" : c.dealerStatus === "pending" ? "Trade · pending" : c.dealerStatus === "rejected" ? "Trade · rejected" : "Dealer"
      : "Customer";

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/customers");
    const json = await res.json().catch(() => ({}));
    if (!res.ok) { toast(json.error || "Failed to load customers", "error"); setList([]); return; }
    setList(json.customers ?? []);
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  // Confirm the high-impact or outbound-email actions before firing.
  const CONFIRM: Record<string, (c: Customer) => string> = {
    "grant-admin": (c) => `Grant full admin console access to ${c.email}?`,
    "revoke-admin": (c) => `Revoke admin access from ${c.email}?`,
    "reject-dealer": (c) => c.dealerStatus === "approved"
      ? `Revoke dealer status and contract pricing from ${c.email}?`
      : `Reject the trade-account request from ${c.email}?`,
    // Approving a reviewed pending request needs no extra confirm; directly
    // granting dealer status to any other account does (it unlocks pricing).
    "approve-dealer": (c) => c.dealerStatus === "pending"
      ? ""
      : `Grant dealer status and contract pricing to ${c.email}?`,
    "send-reset": (c) => `Email a password-reset link to ${c.email}?`,
    "resend-confirmation": (c) => `Resend the confirmation email to ${c.email}?`,
    "confirm-email": (c) => `Manually mark ${c.email} as confirmed (skips the email)?`,
  };
  const SUCCESS_MSG: Record<string, string> = {
    "send-reset": "Password-reset email sent.",
    "resend-confirmation": "Confirmation email resent.",
    "confirm-email": "Email marked confirmed.",
  };
  // Actions that send an email but don't change the list — skip the refetch.
  const NO_REFETCH = new Set(["send-reset", "resend-confirmation"]);

  const act = async (c: Customer, action: string) => {
    const confirmMsg = CONFIRM[action]?.(c);
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    const res = await fetch("/api/admin/customers", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: c.id, action }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return toast(json.error || "Action failed", "error");
    toast(SUCCESS_MSG[action] || "Updated.");
    if (!NO_REFETCH.has(action)) load();
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
    return list.filter((c) => {
      if (typeFilter === "trade-pending" && c.dealerStatus !== "pending") return false;
      if (typeFilter === "dealers" && !(c.role === "dealer" && c.dealerStatus === "approved")) return false;
      if (typeFilter === "admins" && !c.isAdmin) return false;
      if (typeFilter === "customers" && c.role === "dealer") return false;
      if (!s) return true;
      return c.email.toLowerCase().includes(s) || c.company.toLowerCase().includes(s);
    });
  }, [list, q, typeFilter]);

  const exportCsv = () => {
    const rows = filtered ?? [];
    const head = ["Email", "Company", "Type", "Admin", "Confirmed", "Joined", "Last active"];
    const body = rows.map((c) => [
      c.email, c.company, typeOf(c), c.isAdmin ? "yes" : "", c.confirmed ? "yes" : "no",
      new Date(c.createdAt).toISOString().slice(0, 10),
      c.lastSignInAt ? new Date(c.lastSignInAt).toISOString().slice(0, 10) : "",
    ]);
    const csv = toCsv([head, ...body]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const TYPE_CHIPS: [string, string][] = [["all", "All"], ["trade-pending", "Trade · pending"], ["dealers", "Dealers"], ["admins", "Admins"], ["customers", "Customers"]];

  return (
    <>
      <div className="admin-sec-head">
        <span className="admin-sub" style={{ margin: 0 }}>{list?.length ?? "·"} total</span>
        <span className="admin-search"><Search /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email or company…" aria-label="Search customers" /></span>
      </div>

      {(list?.length ?? 0) > 0 && (
        <div className="ord-toolbar">
          <div className="ord-filters">
            {TYPE_CHIPS.map(([k, label]) => (
              <button key={k} className={`ord-chip${typeFilter === k ? " on" : ""}`} onClick={() => setTypeFilter(k)}>{label}</button>
            ))}
          </div>
          <button className="btn btn-line ord-export" onClick={exportCsv} disabled={!filtered?.length}>Export CSV</button>
        </div>
      )}

      {filtered === null ? <div className="skel skel-row" /> : filtered.length === 0 ? (
        <div className="emptybox"><User /><div className="m">No customers{q || typeFilter !== "all" ? " match" : " yet"}</div></div>
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
                    <RowMenu label={`Actions for ${c.email}`}>
                      {c.dealerStatus === "pending" ? (
                        <>
                          <button className="rowmenu-item" onClick={() => act(c, "approve-dealer")}>Approve trade account</button>
                          <button className="rowmenu-item" onClick={() => act(c, "reject-dealer")}>Reject trade request</button>
                        </>
                      ) : c.role === "dealer" && c.dealerStatus === "approved" ? (
                        <button className="rowmenu-item" onClick={() => act(c, "reject-dealer")}>Revoke dealer status</button>
                      ) : (
                        <button className="rowmenu-item" onClick={() => act(c, "approve-dealer")}>Make dealer</button>
                      )}
                      <div className="rowmenu-sep" role="separator" />
                      {c.isAdmin ? (
                        <button className="rowmenu-item" onClick={() => act(c, "revoke-admin")}>Revoke admin access</button>
                      ) : (
                        <button className="rowmenu-item" onClick={() => act(c, "grant-admin")}>Make admin</button>
                      )}
                      <div className="rowmenu-sep" role="separator" />
                      <button className="rowmenu-item" onClick={() => act(c, "send-reset")}>Reset password</button>
                      {!c.confirmed && (
                        <>
                          <button className="rowmenu-item" onClick={() => act(c, "resend-confirmation")}>Resend confirmation</button>
                          <button className="rowmenu-item" onClick={() => act(c, "confirm-email")}>Confirm email</button>
                        </>
                      )}
                    </RowMenu>
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
