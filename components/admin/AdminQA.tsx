"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { useStore } from "../StoreProvider";
import { useAuth } from "../AuthProvider";
import { logAudit } from "@/lib/audit";
import { FileText } from "../icons";

type QRow = {
  id: string;
  product_slug: string;
  author_name: string;
  question: string;
  answer: string | null;
  answered_by: string | null;
  status: string;
  created_at: string;
};

export default function AdminQA() {
  const { toast } = useStore();
  const { user } = useAuth();
  const [rows, setRows] = useState<QRow[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggleSel = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const load = useCallback(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    sb.from("product_questions")
      .select("id,product_slug,author_name,question,answer,answered_by,status,created_at")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => setRows((data as QRow[]) ?? []), () => setRows([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const val = (r: QRow) => (drafts[r.id] !== undefined ? drafts[r.id] : r.answer ?? "");

  const postAnswer = async (r: QRow) => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const text = val(r).trim();
    if (!text) return;
    setBusy(r.id);
    const { error } = await sb
      .from("product_questions")
      .update({ answer: text, answered_by: "L&T Team", answered_at: new Date().toISOString(), status: "published" })
      .eq("id", r.id);
    setBusy(null);
    if (error) {
      // keep the draft so the admin's typed answer isn't lost
      return toast(error.message || "Couldn’t post the answer — try again", "error");
    }
    logAudit(user, "qa.answer", r.product_slug, `Answered a question`);
    toast(r.answer ? "Answer updated" : "Answer posted");
    setDrafts((d) => { const n = { ...d }; delete n[r.id]; return n; });
    load();
  };

  const bulkAct = async (action: "hide" | "publish" | "delete") => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const ids = [...selected];
    if (ids.length === 0) return;
    if (action === "delete" && !window.confirm(`Delete ${ids.length} question${ids.length === 1 ? "" : "s"} permanently?`)) return;
    setBusy("__bulk");
    const { error } = action === "delete"
      ? await sb.from("product_questions").delete().in("id", ids)
      : await sb.from("product_questions").update({ status: action === "hide" ? "hidden" : "published" }).in("id", ids);
    setBusy(null);
    setSelected(new Set());
    if (error) return toast(error.message || "Bulk update failed", "error");
    logAudit(user, `qa.${action}`, `${ids.length} questions`, action === "delete" ? "Bulk deleted" : action === "hide" ? "Bulk hid" : "Bulk published");
    const verb = action === "delete" ? "deleted" : action === "hide" ? "hidden" : "published";
    toast(`${ids.length} question${ids.length === 1 ? "" : "s"} ${verb}`);
    load();
  };

  const act = async (r: QRow, action: "hide" | "publish" | "delete") => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    if (action === "delete" && !window.confirm("Delete this question permanently? This cannot be undone.")) return;
    setBusy(r.id);
    const { error } =
      action === "delete"
        ? await sb.from("product_questions").delete().eq("id", r.id)
        : await sb.from("product_questions").update({ status: action === "hide" ? "hidden" : "published" }).eq("id", r.id);
    setBusy(null);
    if (error) return toast(error.message || "Couldn’t update the question — try again", "error");
    logAudit(user, `qa.${action}`, r.product_slug, action === "delete" ? "Deleted a question" : action === "hide" ? "Hid a question" : "Published a question");
    toast(action === "delete" ? "Question deleted" : action === "hide" ? "Question hidden" : "Question published");
    load();
  };

  const unanswered = rows?.filter((r) => !r.answer).length ?? 0;

  const filtered = useMemo(() => {
    if (!rows) return [];
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "unanswered" && r.answer) return false;
      if (filter === "hidden" && r.status !== "hidden") return false;
      if (!s) return true;
      return (
        r.question.toLowerCase().includes(s) ||
        r.author_name.toLowerCase().includes(s) ||
        r.product_slug.toLowerCase().includes(s) ||
        (r.answer ?? "").toLowerCase().includes(s)
      );
    });
  }, [rows, filter, q]);

  return (
    <>
      <div className="admin-sec-head">
        <h2 className="admin-h">Product Q&amp;A <span className="admin-count">{rows ? `${unanswered} unanswered` : "·"}</span></h2>
      </div>
      {rows === null ? (
        <div className="skel skel-row" />
      ) : rows.length === 0 ? (
        <div className="emptybox">
          <FileText />
          <div className="m">No questions yet</div>
          <div className="s">Questions asked on product pages appear here to answer.</div>
        </div>
      ) : (
        <>
        <div className="ord-toolbar">
          <div className="ord-filters">
            {["all", "unanswered", "hidden"].map((s) => (
              <button key={s} className={`ord-chip${filter === s ? " on" : ""}`} onClick={() => setFilter(s)}>{s}</button>
            ))}
          </div>
          <input className="ord-search" placeholder="Search question, author, product…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search questions" />
        </div>
        {selected.size > 0 && (
          <div className="admin-bulkbar">
            <span className="abb-count">{selected.size} selected</span>
            <button onClick={() => bulkAct("publish")} disabled={busy === "__bulk"}>Publish</button>
            <button onClick={() => bulkAct("hide")} disabled={busy === "__bulk"}>Hide</button>
            <button className="danger" onClick={() => bulkAct("delete")} disabled={busy === "__bulk"}>Delete</button>
            <button onClick={() => setSelected(new Set())}>Clear</button>
          </div>
        )}
        {filtered.length === 0 ? (
          <div className="emptybox"><FileText /><div className="m">No questions match</div><div className="s">Try a different filter or search term.</div></div>
        ) : (
        <div className="admin-cards">
          {filtered.map((r) => (
            <div className={`admin-card qa-admin${r.status === "hidden" ? " is-hidden" : ""}`} key={r.id}>
              <input type="checkbox" className="admin-check" checked={selected.has(r.id)} onChange={() => toggleSel(r.id)} aria-label="Select question" />
              <div className="ac-main">
                <div className="ac-title">
                  <a href={`/products/${r.product_slug}#qa`} target="_blank" rel="noreferrer">{r.product_slug}</a>
                  <span className="ac-date">{new Date(r.created_at).toLocaleDateString()}</span>
                  {!r.answer && <span className="qa-unanswered">Unanswered</span>}
                </div>
                <div className="ac-sub ac-msg"><b>Q:</b> {r.question} <span className="qa-by">— {r.author_name}</span></div>
                <div className="qa-answer-box">
                  <textarea
                    value={val(r)}
                    onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                    rows={2}
                    placeholder="Type an answer…"
                  />
                  <button className="btn btn-primary" disabled={busy === r.id || !val(r).trim()} onClick={() => postAnswer(r)}>
                    {r.answer ? "Update answer" : "Post answer"}
                  </button>
                </div>
              </div>
              <div className="qr-admin-actions">
                {r.status === "published" ? (
                  <button className="qr-status-btn" disabled={busy === r.id} onClick={() => act(r, "hide")}>Hide</button>
                ) : (
                  <button className="qr-status-btn" disabled={busy === r.id} onClick={() => act(r, "publish")}>Publish</button>
                )}
                <button className="rv-del" disabled={busy === r.id} onClick={() => act(r, "delete")}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        )}
        </>
      )}
    </>
  );
}
