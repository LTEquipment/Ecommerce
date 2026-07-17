"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import Stars from "./Stars";
import { Star, Check } from "./icons";
import type { Review, ReviewStats, ReviewEligibility } from "@/lib/reviews";

export default function ProductReviews({
  slug,
  initialReviews,
  initialStats,
}: {
  slug: string;
  initialReviews: Review[];
  initialStats: ReviewStats | null;
}) {
  const { configured, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [stats, setStats] = useState<ReviewStats | null>(initialStats);
  const [elig, setElig] = useState<ReviewEligibility | null>(null);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
      if (!res.ok) return;
      const d = await res.json();
      setReviews(d.reviews ?? []);
      setStats(d.stats ?? null);
      setElig(d.eligibility ?? null);
    } catch {
      /* keep current data */
    }
  }, [slug]);

  // Load eligibility (+ fresh data) once we know the auth state.
  useEffect(() => {
    if (configured) refresh();
  }, [configured, user?.id, refresh]);

  const total = reviews.length;
  const breakdown = useMemo(() => {
    const b = [0, 0, 0, 0, 0]; // index 0 → 1★ … index 4 → 5★
    for (const r of reviews) if (r.rating >= 1 && r.rating <= 5) b[r.rating - 1]++;
    return b;
  }, [reviews]);

  const startEdit = () => {
    const m = elig?.mine;
    setRating(m?.rating ?? 0);
    setTitle(m?.title ?? "");
    setBody(m?.body ?? "");
    setEditing(true);
    setErr("");
  };

  const submit = async () => {
    if (rating < 1) return setErr("Please choose a star rating.");
    if (body.trim().length < 3) return setErr("Please write a few words.");
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, rating, title: title.trim() || null, body: body.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(d.error || "Could not save your review.");
      } else {
        setEditing(false);
        await refresh();
        router.refresh();
      }
    } catch {
      setErr("Network error — please try again.");
    }
    setBusy(false);
  };

  const remove = async () => {
    setBusy(true);
    setErr("");
    try {
      await fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
      setEditing(false);
      await refresh();
      router.refresh();
    } catch {
      setErr("Could not remove your review.");
    }
    setBusy(false);
  };

  const activeStars = hover || rating;
  const showForm = editing || Boolean(elig?.canReview);

  return (
    <section id="reviews" className="reviews wrap">
      <div className="rv-head">
        <h2>Customer reviews</h2>
      </div>

      <div className="rv-top">
        <div className="rv-summary">
          {stats && stats.count > 0 ? (
            <>
              <div className="rv-big">{stats.avg.toFixed(1)}</div>
              <Stars value={stats.avg} size={18} />
              <div className="rv-count">
                {stats.count} verified review{stats.count === 1 ? "" : "s"}
              </div>
            </>
          ) : (
            <>
              <div className="rv-big rv-big-empty">—</div>
              <Stars value={0} size={18} />
              <div className="rv-count">No reviews yet</div>
            </>
          )}
        </div>
        {total > 0 && (
          <div className="rv-bars">
            {[5, 4, 3, 2, 1].map((s) => {
              const c = breakdown[s - 1];
              const pct = total ? Math.round((c / total) * 100) : 0;
              return (
                <div className="rv-bar" key={s}>
                  <span className="rv-bar-l">{s}★</span>
                  <span className="rv-bar-track">
                    <span className="rv-bar-fill" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="rv-bar-n">{c}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rv-write">
        {!configured || elig === null ? null : !elig.loggedIn ? (
          <p className="rv-gate">
            Only verified purchasers can review this product.{" "}
            <Link href={`/login?next=${encodeURIComponent(pathname)}`}>Sign in</Link>
          </p>
        ) : elig.alreadyReviewed && !editing ? (
          <div className="rv-mine">
            <div className="rv-mine-head">
              <Stars value={elig.mine?.rating ?? 0} />
              <span className="rv-mine-tag">
                Your review{elig.mine?.status === "hidden" ? " · under review" : ""}
              </span>
            </div>
            {elig.mine?.title && <div className="rv-mine-title">{elig.mine.title}</div>}
            <p className="rv-mine-body">{elig.mine?.body}</p>
            <div className="rv-mine-actions">
              <button className="btn btn-line" onClick={startEdit}>Edit</button>
              <button className="rv-del" onClick={remove} disabled={busy}>Delete</button>
            </div>
          </div>
        ) : showForm ? (
          <div className="rv-form">
            <h3>{editing ? "Edit your review" : "Write a review"}</h3>
            <div className="rv-stars-pick" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  type="button"
                  key={i}
                  role="radio"
                  aria-checked={rating === i}
                  className={`rv-star ${i <= activeStars ? "on" : ""}`}
                  onMouseEnter={() => setHover(i)}
                  onClick={() => setRating(i)}
                  aria-label={`${i} star${i === 1 ? "" : "s"}`}
                >
                  <Star aria-hidden="true" />
                </button>
              ))}
              <span className="rv-star-hint">{activeStars ? `${activeStars} / 5` : "Tap to rate"}</span>
            </div>
            <input
              className="rv-input"
              placeholder="Title (optional)"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="rv-textarea"
              placeholder="What stood out — build quality, firepower, freight, install?"
              value={body}
              maxLength={4000}
              rows={4}
              onChange={(e) => setBody(e.target.value)}
            />
            {err && <div className="rv-err">{err}</div>}
            <div className="rv-form-actions">
              <button className="btn btn-primary" onClick={submit} disabled={busy}>
                {busy ? "Saving…" : editing ? "Save changes" : "Submit review"}
              </button>
              {editing && (
                <button className="btn btn-line" onClick={() => { setEditing(false); setErr(""); }} disabled={busy}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="rv-gate">
            Only verified purchasers can review this product. Once your order ships, you can share your
            experience here.
          </p>
        )}
      </div>

      {reviews.length > 0 && (
        <ul className="rv-list">
          {reviews.map((r) => (
            <li className="rv-item" key={r.id}>
              <div className="rv-item-head">
                <Stars value={r.rating} />
                {r.title && <span className="rv-item-title">{r.title}</span>}
              </div>
              <div className="rv-item-meta">
                <span className="rv-author">{r.author_name}</span>
                {r.verified && (
                  <span className="rv-verified">
                    <Check /> Verified Purchase
                  </span>
                )}
                <span className="rv-date">
                  {new Date(r.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="rv-body">{r.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
