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
  "claim.status": "Warranty",
  "ticket.status": "Ticket",
  "dealer.approve": "Dealer",
  "dealer.reject": "Dealer",
  "admin.grant": "Admin",
  "admin.revoke": "Admin",
};
function tone(a: string) {
  if (a === "admin.grant" || a === "dealer.approve" || a === "product.create" || a === "category.create") return "ok";
  if (a === "admin.revoke" || a === "dealer.reject" || a === "product.delete" || a === "category.delete") return "mut";
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
      .then(({ data }) => setRows((data as Entry[]) ?? []));
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
          <span className={`pill ${tone(r.action)}`}>{LABEL[r.action] || r.action}</span>
          <div className="audit-main">
            <div className="audit-detail"><b>{r.target || "—"}</b> {r.detail || ""}</div>
            <div className="audit-meta">{r.actor_email || "system"} · {new Date(r.created_at).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
