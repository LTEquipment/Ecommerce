"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { useStore } from "./StoreProvider";

/**
 * Email notification preferences. The "Promotions & new arrivals" toggle is
 * REAL — it subscribes/unsubscribes the user's email against the newsletter
 * list via /api/account/notifications. Transactional order/account emails are
 * shown as always-on (they aren't optional). Renders nothing until the current
 * state loads, so a backend hiccup just hides the section.
 */
export default function NotificationPrefs() {
  const { user } = useAuth();
  const { toast } = useStore();
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetch("/api/account/notifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d) setSubscribed(!!d.subscribed); })
      .catch(() => {});
    return () => { alive = false; };
  }, [user]);

  const toggle = async (next: boolean) => {
    const prev = subscribed;
    setSubscribed(next); // optimistic
    setBusy(true);
    const res = await fetch("/api/account/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscribed: next }),
    });
    setBusy(false);
    if (!res.ok) {
      setSubscribed(prev);
      toast("Couldn’t update your preferences — please try again.");
      return;
    }
    toast(next ? "You’re subscribed to updates." : "Unsubscribed from marketing emails.");
  };

  if (subscribed === null) return null;

  return (
    <section className="notif-prefs" aria-label="Email notifications">
      <h3 className="prof-h">Email notifications</h3>

      <div className="notif-row">
        <div className="notif-txt">
          <b>Order &amp; account emails</b>
          <span>Order confirmations, shipping updates and account security.</span>
        </div>
        <span className="notif-always">Always on</span>
      </div>

      <label className="notif-row">
        <div className="notif-txt">
          <b>Promotions &amp; new arrivals</b>
          <span>Occasional emails about new equipment, guides and offers.</span>
        </div>
        <span className="switch">
          <input
            type="checkbox"
            role="switch"
            checked={subscribed}
            disabled={busy}
            onChange={(e) => toggle(e.target.checked)}
            aria-label="Promotions and new-arrival emails"
          />
          <span className="switch-track" aria-hidden="true" />
        </span>
      </label>
    </section>
  );
}
