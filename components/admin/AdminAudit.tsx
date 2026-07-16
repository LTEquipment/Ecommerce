"use client";

import { useCallback, useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
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

export default function AdminAudit() {
  const [rows, setRows] = useState<Entry[] | null>(null);

  const load = useCallback(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    sb.from("audit_log")
      .select("id,actor_email,action,target,detail,created_at")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => setRows((data as Entry[]) ?? []), () => setRows([]));
  }, []);

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

  if (rows === null) return <div className="skel skel-row" />;
  if (rows.length === 0) {
    return <div className="emptybox"><FileText /><div className="m">No activity yet</div><div className="s">Admin actions — product edits, order &amp; ticket status changes, dealer approvals, admin grants — are recorded here.</div></div>;
  }

  return (
    <div className="audit-list">
      {rows.map((r) => (
        <div className="audit-row" key={r.id}>
          <span className={`pill ${tone(r.action)}`}>{labelFor(r.action)}</span>
          <div className="audit-main">
            <div className="audit-detail"><b>{r.target || "—"}</b> {r.detail || ""}</div>
            <div className="audit-meta">{r.actor_email || "system"} · {new Date(r.created_at).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
