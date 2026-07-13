"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "../StoreProvider";
import { Search, User } from "../icons";

type Customer = {
  id: string; email: string; company: string; role: string;
  dealerStatus: string | null; createdAt: string; lastSignInAt: string | null;
  confirmed: boolean; isAdmin: boolean;
};

export default function AdminCustomers() {
  const { toast } = useStore();
  const [list, setList] = useState<Customer[] | null>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/customers");
    const json = await res.json().catch(() => ({}));
    if (!res.ok) { toast(json.error || "Failed to load customers"); setList([]); return; }
    setList(json.customers ?? []);
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const act = async (userId: string, action: string) => {
    setBusy(userId + action);
    const res = await fetch("/api/admin/customers", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, action }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return toast(json.error || "Action failed");
    toast("Updated.");
    load();
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
          <div className="cust-thead"><span>Customer</span><span>Type</span><span>Joined</span><span>Last active</span><span>Actions</span></div>
          {filtered.map((c) => (
            <div className="cust-row" key={c.id}>
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
              <div className="cust-date">{new Date(c.createdAt).toLocaleDateString()}</div>
              <div className="cust-date">{c.lastSignInAt ? new Date(c.lastSignInAt).toLocaleDateString() : "—"}</div>
              <div className="cust-actions">
                {c.dealerStatus === "pending" && (
                  <>
                    <button className="btn btn-primary btn-xs" disabled={busy === c.id + "approve-dealer"} onClick={() => act(c.id, "approve-dealer")}>Approve</button>
                    <button className="btn btn-line btn-xs" disabled={busy === c.id + "reject-dealer"} onClick={() => act(c.id, "reject-dealer")}>Reject</button>
                  </>
                )}
                {c.isAdmin ? (
                  <button className="btn btn-line btn-xs" disabled={busy === c.id + "revoke-admin"} onClick={() => act(c.id, "revoke-admin")}>Revoke admin</button>
                ) : (
                  <button className="btn btn-line btn-xs" disabled={busy === c.id + "grant-admin"} onClick={() => act(c.id, "grant-admin")}>Make admin</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
