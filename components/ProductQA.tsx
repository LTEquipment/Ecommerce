"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import type { Question } from "@/lib/questions";

export default function ProductQA({ slug, initialQuestions }: { slug: string; initialQuestions: Question[] }) {
  const { configured, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [asking, setAsking] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/questions?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setQuestions(d.questions ?? []);
      }
    } catch {
      /* keep current */
    }
  }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length < 5) return setErr("Please write your question.");
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, question: q.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) setErr(d.error || "Could not submit your question.");
      else {
        setQ("");
        setAsking(false);
        await refresh();
        router.refresh();
      }
    } catch {
      setErr("Network error — please try again.");
    }
    setBusy(false);
  };

  return (
    <section id="qa" className="qa wrap">
      <div className="qa-head">
        <h2>Questions &amp; answers</h2>
        {!asking && <button className="btn btn-line" onClick={() => setAsking(true)}>Ask a question</button>}
      </div>

      {asking &&
        (configured && !user ? (
          <p className="qa-gate">
            Please <Link href={`/login?next=${encodeURIComponent(pathname)}`}>sign in</Link> to ask a question.
          </p>
        ) : (
          <form className="qa-form" onSubmit={submit}>
            <textarea
              value={q}
              onChange={(e) => setQ(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Ask about specs, gas type, freight, install…"
              autoFocus
            />
            {err && <div className="qa-err">{err}</div>}
            <div className="qa-form-actions">
              <button className="btn btn-primary" disabled={busy} type="submit">{busy ? "Posting…" : "Post question"}</button>
              <button className="btn btn-line" type="button" onClick={() => { setAsking(false); setErr(""); }}>Cancel</button>
            </div>
          </form>
        ))}

      {questions.length === 0 ? (
        <p className="qa-empty">No questions yet — ask the first one. Our New York team answers spec, freight and install questions.</p>
      ) : (
        <ul className="qa-list">
          {questions.map((x) => (
            <li className="qa-item" key={x.id}>
              <div className="qa-q">
                <span className="qa-badge">Q</span>
                <div>
                  <p>{x.question}</p>
                  <span className="qa-meta">{x.author_name} · {new Date(x.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {x.answer ? (
                <div className="qa-a">
                  <span className="qa-badge a">A</span>
                  <div>
                    <p>{x.answer}</p>
                    <span className="qa-meta">
                      {x.answered_by || "L&T Team"}
                      {x.answered_at ? ` · ${new Date(x.answered_at).toLocaleDateString()}` : ""}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="qa-pending">Awaiting an answer from our team.</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
