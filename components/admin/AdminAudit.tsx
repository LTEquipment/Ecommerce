"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { toCsv } from "@/lib/csv";
import { FileText } from "../icons";

type Entry = { id: string; actor_email: string | null; action: string; target: string | null; detail: string | null; created_at: string };

const LABEL: Record<string, string> = {
  "product.create": "Product",
  "product.update": "Product",
  "product.delete": "Product",
  "category.create": "Category",
  "category.update": "Category",
  "category.delete": "Category",
  "order.status": "Order",
  "order.tracking": "Tracking",
  "claim.status": "Warranty",
  "ticket.status": "Ticket",
  "dealer.approve": "Dealer",
  "dealer.reject": "Dealer",
  "admin.grant": "Admin",
  "admin.revoke": "Admin",
  "settings.update": "Settings",
  "contact.handled": "Inbox",
  "stock.notified": "Stock",
};
// Resolve a readable label, with prefix fallbacks so status-encoded actions
// (quote.won, review.hide, qa.answer, …) never render as a raw slug.
function labelFor(a: string): string {
  if (LABEL[a]) return LABEL[a];
  if (a.startsWith("quote.")) return "Quote";
  if (a.startsWith("review.")) return "Review";
  if (a.startsWith("qa.")) return "Q&A";
  return a;
}
function tone(a: string) {
  if (["admin.grant", "dealer.approve", "product.create", "category.create"].includes(a)) return "ok";
  if (["admin.revoke", "dealer.reject", "product.delete", "category.delete", "review.delete", "qa.delete"].includes(a)) return "mut";
  return "info";
}
// Coarse groups so the filter chips stay readable across ~15 action labels.
function groupFor(action: string): string {
  const l = labelFor(action);
  if (l === "Product" || l === "Category") return "Catalog";
  if (l === "Order" || l === "Tracking") return "Orders";
  if (l === "Dealer" || l === "Admin") return "People";
  if (l === "Warranty" || l === "Ticket" || l === "Inbox" || l === "Stock") return "Support";
  if (l === "Review" || l === "Q&A" || l === "Quote") return "Content";
  if (l === "Settings") return "Settings";
  return "Other";
}
const GROUPS = ["all", "Catalog", "Orders", "People", "Support", "Content", "Settings"];

export default function AdminAudit() {
  const [rows, setRows] = useState<Entry[] | null>(null);
  const [group, setGroup] = useState("all");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(200);

  const load = useCallback(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    sb.from("audit_log")
      .select("id,actor_email,action,target,detail,created_at")
      .order("created_at", { ascending: false })
      .limit(limit)
      .then(({ data }) => setRows((data as Entry[]) ?? []), () => setRows([]));
  }, [limit]);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    load();
    const ch = sb
      .channel("rt-audit")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "audit_log" }, () => load())
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [load]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (group !== "all" && groupFor(r.action) !== group) return false;
      if (!s) return true;
      return (
        (r.actor_email ?? "").toLowerCase().includes(s) ||
        (r.target ?? "").toLowerCase().includes(s) ||
        (r.detail ?? "").toLowerCase().includes(s) ||
        labelFor(r.action).toLowerCase().includes(s)
      );
    });
  }, [rows, group, q]);

  const exportCsv = () => {
    const head = ["Date", "Action", "Actor", "Target", "Detail"];
    const body = filtered.map((r) => [
      new Date(r.created_at).toISOString(),
      `${labelFor(r.action)} (${r.action})`,
      r.actor_email ?? "system",
      r.target ?? "",
      r.detail ?? "",
    ]);
    const csv = toCsv([head, ...body]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (rows === null) return <div className="skel skel-row" />;
  if (rows.length === 0) {
    return <div className="emptybox"><FileText /><div className="m">No activity yet</div><div className="s">Admin actions — product edits, order &amp; ticket status changes, dealer approvals, admin grants — are recorded here.</div></div>;
  }

  return (
    <>
      <div className="ord-toolbar">
        <div className="ord-filters">
          {GROUPS.map((g) => (
            <button key={g} className={`ord-chip${group === g ? " on" : ""}`} onClick={() => setGroup(g)}>{g}</button>
          ))}
        </div>
        <input className="ord-search" placeholder="Search actor, target, detail…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search audit log" />
        <button className="btn btn-line ord-export" onClick={exportCsv} disabled={!filtered.length}>Export CSV</button>
      </div>
      {filtered.length === 0 ? (
        <div className="emptybox"><FileText /><div className="m">No entries match</div><div className="s">Try a different group or search term.</div></div>
      ) : (
        <div className="audit-list">
          {filtered.map((r) => (
            <div className="audit-row" key={r.id}>
              <span className={`pill ${tone(r.action)}`}>{labelFor(r.action)}</span>
              <div className="audit-main">
                <div className="audit-detail"><b>{r.target || "—"}</b> {r.detail || ""}</div>
                <div className="audit-meta">{r.actor_email || "system"} · {new Date(r.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {rows.length >= limit && (
        <div className="audit-more">
          <button className="btn btn-line" onClick={() => setLimit((l) => l + 200)}>Load more</button>
        </div>
      )}
    </>
  );
}
