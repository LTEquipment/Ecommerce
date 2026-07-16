"use client";

import { useCallback, useEffect, useState } from "react";
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
        <div className="admin-cards">
          {rows.map((r) => (
            <div className={`admin-card qa-admin${r.status === "hidden" ? " is-hidden" : ""}`} key={r.id}>
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
  );
}
