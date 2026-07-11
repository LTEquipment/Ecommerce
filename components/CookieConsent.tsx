"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Prefs = { necessary: true; analytics: boolean; marketing: boolean };
const KEY = "lt-cookie-consent";
export const OPEN_EVENT = "lt:open-cookie-prefs";

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [managing, setManaging] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* storage blocked — show it anyway */
      setShow(true);
    }
    const reopen = () => {
      try {
        const saved = localStorage.getItem(KEY);
        if (saved) {
          const p = JSON.parse(saved);
          setAnalytics(p.analytics ?? true);
          setMarketing(p.marketing ?? true);
        }
      } catch {}
      setManaging(true);
      setShow(true);
    };
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  const save = (prefs: Prefs) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...prefs, ts: new Date().toISOString() }));
    } catch {}
    setShow(false);
    setManaging(false);
  };
  const acceptAll = () => save({ necessary: true, analytics: true, marketing: true });
  const rejectAll = () => save({ necessary: true, analytics: false, marketing: false });
  const savePrefs = () => save({ necessary: true, analytics, marketing });

  if (!show) return null;

  return (
    <div className="cookie" role="dialog" aria-label="Cookie consent" aria-live="polite">
      <div className="cookie-inner">
        {!managing ? (
          <>
            <div className="cookie-txt">
              <b>We value your privacy</b>
              <p>
                We use cookies to run the site, remember your cart, and understand how it&apos;s used.
                You can accept all, reject non-essential, or choose what to allow. See our{" "}
                <Link href="/cookies">Cookie Policy</Link>.
              </p>
            </div>
            <div className="cookie-actions">
              <button className="btn btn-line" onClick={() => setManaging(true)}>Manage preferences</button>
              <button className="btn btn-line" onClick={rejectAll}>Reject non-essential</button>
              <button className="btn btn-primary" onClick={acceptAll}>Accept all</button>
            </div>
          </>
        ) : (
          <>
            <div className="cookie-prefs">
              <b>Manage cookie preferences</b>
              <label className="cookie-row">
                <span><b>Strictly necessary</b><em>Required to run the site and remember your cart — always on.</em></span>
                <input type="checkbox" checked disabled aria-label="Strictly necessary (always on)" />
              </label>
              <label className="cookie-row">
                <span><b>Analytics</b><em>Helps us understand how the site is used so we can improve it.</em></span>
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
              </label>
              <label className="cookie-row">
                <span><b>Marketing</b><em>Used to measure campaigns and show relevant offers.</em></span>
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
              </label>
            </div>
            <div className="cookie-actions">
              <button className="btn btn-line" onClick={rejectAll}>Reject all</button>
              <button className="btn btn-primary" onClick={savePrefs}>Save preferences</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
