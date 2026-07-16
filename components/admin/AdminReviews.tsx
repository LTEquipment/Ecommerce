"use client";

import { useCallback, useEffect, useState } from "react";
import Stars from "../Stars";
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
  const [rows, setRows] = useState<AdminReview[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/reviews", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setRows(d.reviews ?? []))
      .catch(() => setRows([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, action: "hide" | "publish" | "delete") => {
    if (action === "delete" && !window.confirm("Delete this review permanently?")) return;
    setBusy(id);
    await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    }).catch(() => {});
    setBusy(null);
    load();
  };

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
        <div className="admin-cards">
          {rows.map((r) => (
            <div className={`admin-card rv-admin${r.status === "hidden" ? " is-hidden" : ""}`} key={r.id}>
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
  );
}
