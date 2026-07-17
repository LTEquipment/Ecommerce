"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "../StoreProvider";
import { useAuth } from "../AuthProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { logAudit } from "@/lib/audit";

type DReq = { id: string; user_id: string; email: string | null; reason: string | null; status: string; created_at: string };

const STATUS = ["pending", "processing", "completed", "cancelled"];
function tone(s: string) {
  if (s === "completed") return "ok";
  if (s === "processing") return "warn";
  if (s === "cancelled") return "mut";
  return "info"; // pending
}

/**
 * Account-deletion request queue, shown atop the Customers tab. Renders nothing
 * when there are no requests (or before the account-deletion migration is run),
 * so it stays out of the way until there's something to act on.
 */
export default function AdminDeletionRequests() {
  const { toast } = useStore();
  const { user } = useAuth();
  const [rows, setRows] = useState<DReq[] | null>(null);

  const load = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb) { setRows([]); return; }
    sb.from("account_deletion_requests")
      .select("id,user_id,email,reason,status,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as DReq[]) ?? []), () => setRows([]));
  }, []);
  useEffect(() => { load(); }, [load]);

  const update = async (id: string, status: string) => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    setRows((p) => p?.map((r) => (r.id === id ? { ...r, status } : r)) ?? p);
    const patch: Record<string, unknown> = { status };
    if (status === "completed" || status === "cancelled") patch.processed_at = new Date().toISOString();
    if (status === "completed") patch.processed_by = user?.id ?? null;
    const { error } = await sb.from("account_deletion_requests").update(patch).eq("id", id);
    if (error) { toast(error.message, "error"); load(); return; }
    logAudit(user, "account.deletion", `#${id.slice(0, 8)}`, `→ ${status}`);
    toast(`Deletion request → ${status}`);
  };

  if (rows === null || rows.length === 0) return null;
  const openCount = rows.filter((r) => r.status === "pending" || r.status === "processing").length;

  return (
    <div className="admin-del">
      <div className="admin-sec-head">
        <h2 className="admin-h">Account deletion requests <span className="admin-count">{openCount}</span></h2>
      </div>
      <div className="admin-cards">
        {rows.map((r) => (
          <div className="admin-card" key={r.id}>
            <div className="ac-main">
              <div className="ac-title">{r.email || "Account holder"} <span className="ac-date">{new Date(r.created_at).toLocaleDateString()}</span></div>
              <div className="ac-sub">{r.reason ? `“${r.reason}”` : "No reason given"} · user {r.user_id.slice(0, 8)}</div>
            </div>
            <div className="ac-status">
              <span className={`pill ${tone(r.status)}`}>{r.status}</span>
              <select value={r.status} onChange={(e) => update(r.id, e.target.value)} aria-label="Deletion request status">
                {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
