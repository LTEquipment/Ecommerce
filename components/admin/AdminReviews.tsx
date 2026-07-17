"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Stars from "../Stars";
import { useStore } from "../StoreProvider";
import { Star } from "../icons";

type AdminReview = {
  id: string;
  product_slug: string;
  rating: number;
  title: string | null;
  body: string;
  author_name: string;
  verified: boolean;
  status: string;
  created_at: string;
};

export default function AdminReviews() {
  const { toast } = useStore();
  const [rows, setRows] = useState<AdminReview[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggleSel = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const load = useCallback(() => {
    fetch("/api/admin/reviews", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setRows(d.reviews ?? []))
      .catch(() => setRows([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const bulkAct = async (action: "hide" | "publish" | "delete") => {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (action === "delete" && !window.confirm(`Delete ${ids.length} review${ids.length === 1 ? "" : "s"} permanently?`)) return;
    setBusy("__bulk");
    const results = await Promise.all(ids.map((id) =>
      fetch("/api/admin/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) })
        .then((r) => r.ok).catch(() => false)
    ));
    setBusy(null);
    setSelected(new Set());
    const ok = results.filter(Boolean).length;
    const verb = action === "delete" ? "deleted" : action === "hide" ? "hidden" : "published";
    if (ok < ids.length) toast(`${ok}/${ids.length} updated — some failed`, "error");
    else toast(`${ok} review${ok === 1 ? "" : "s"} ${verb}`);
    load();
  };

  const act = async (id: string, action: "hide" | "publish" | "delete") => {
    if (action === "delete" && !window.confirm("Delete this review permanently?")) return;
    setBusy(id);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error(String(res.status));
      toast(action === "delete" ? "Review deleted" : action === "hide" ? "Review hidden" : "Review published");
      load();
    } catch {
      toast("Couldn’t update the review — try again", "error");
    } finally {
      setBusy(null);
    }
  };

  const filtered = useMemo(() => {
    if (!rows) return [];
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!s) return true;
      return (
        r.author_name.toLowerCase().includes(s) ||
        (r.title ?? "").toLowerCase().includes(s) ||
        r.body.toLowerCase().includes(s) ||
        r.product_slug.toLowerCase().includes(s)
      );
    });
  }, [rows, statusFilter, q]);

  // Drop hidden rows from the selection so a bulk action never touches a row the
  // filter/search has hidden (the count, confirm and action stay in agreement).
  useEffect(() => {
    setSelected((prev) => {
      const visible = new Set(filtered.map((r) => r.id));
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [filtered]);

  return (
    <>
      <div className="admin-sec-head">
        <h2 className="admin-h">
          Reviews <span className="admin-count">{rows?.length ?? "·"}</span>
        </h2>
      </div>
      {rows === null ? (
        <div className="skel skel-row" />
      ) : rows.length === 0 ? (
        <div className="emptybox">
          <Star />
          <div className="m">No reviews yet</div>
          <div className="s">Verified-purchaser reviews appear here as customers submit them.</div>
        </div>
      ) : (
        <>
        <div className="ord-toolbar">
          <div className="ord-filters">
            {["all", "published", "hidden"].map((s) => (
              <button key={s} className={`ord-chip${statusFilter === s ? " on" : ""}`} onClick={() => setStatusFilter(s)}>{s}</button>
            ))}
          </div>
          <input className="ord-search" placeholder="Search author, text, product…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search reviews" />
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
          <div className="emptybox"><Star /><div className="m">No reviews match</div><div className="s">Try a different status or search term.</div></div>
        ) : (
        <div className="admin-cards">
          {filtered.map((r) => (
            <div className={`admin-card rv-admin${r.status === "hidden" ? " is-hidden" : ""}`} key={r.id}>
              <input type="checkbox" className="admin-check" checked={selected.has(r.id)} onChange={() => toggleSel(r.id)} aria-label="Select review" />
              <div className="ac-main">
                <div className="ac-title">
                  <Stars value={r.rating} /> {r.title || "—"}
                  <span className="ac-date">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <div className="ac-sub">
                  <b>{r.author_name}</b>
                  {r.verified ? " · Verified" : ""} ·{" "}
                  <a href={`/products/${r.product_slug}`} target="_blank" rel="noreferrer">
                    {r.product_slug}
                  </a>
                  {r.status === "hidden" && <span className="rv-hidden-tag">Hidden</span>}
                </div>
                <div className="ac-sub ac-msg">{r.body}</div>
              </div>
              <div className="rv-admin-actions">
                {r.status === "published" ? (
                  <button className="btn btn-line" disabled={busy === r.id} onClick={() => act(r.id, "hide")}>
                    Hide
                  </button>
                ) : (
                  <button className="btn btn-line" disabled={busy === r.id} onClick={() => act(r.id, "publish")}>
                    Publish
                  </button>
                )}
                <button className="rv-del" disabled={busy === r.id} onClick={() => act(r.id, "delete")}>
                  Delete
                </button>
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
