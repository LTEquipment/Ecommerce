"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Prefs = { necessary: true; analytics: boolean; marketing: boolean };
const KEY = "lt-cookie-consent";
export const OPEN_EVENT = "lt:open-cookie-prefs";

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="cc-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
      />
      <span className="cc-switch-track" aria-hidden="true" />
    </label>
  );
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);
  const closeRef = useRef<HTMLButtonElement>(null);

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
      setShow(true);
    };
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  // Lock body scroll, handle Esc, and move focus into the dialog while open.
  useEffect(() => {
    if (!show) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShow(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [show]);

  const save = (prefs: Prefs) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...prefs, ts: new Date().toISOString() }));
    } catch {}
    setShow(false);
  };
  const acceptAll = () => save({ necessary: true, analytics: true, marketing: true });
  const rejectAll = () => save({ necessary: true, analytics: false, marketing: false });
  const savePrefs = () => save({ necessary: true, analytics, marketing });

  if (!show) return null;

  return (
    <div className="cc-overlay">
      <div
        className="cc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cc-title"
        aria-describedby="cc-desc"
      >
        <button
          ref={closeRef}
          type="button"
          className="cc-close"
          onClick={() => setShow(false)}
          aria-label="Close without changing your choices"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <h2 id="cc-title" className="cc-title">Privacy preferences</h2>
        <p id="cc-desc" className="cc-desc">
          L&amp;T and our partners use cookies to run the site, remember your cart, measure
          performance and improve your experience. Choose which categories to allow — you can change
          this anytime. See our <Link href="/cookies">Cookie Policy</Link>.
        </p>

        <div className="cc-cats">
          <div className="cc-cat">
            <div className="cc-cat-head">
              <b>Strictly necessary</b>
              <span className="cc-always">Always on</span>
            </div>
            <p>Required to run the site, keep you signed in and remember your cart. These can&apos;t be switched off.</p>
          </div>

          <div className="cc-cat">
            <div className="cc-cat-head">
              <b>Analytics</b>
              <Switch checked={analytics} onChange={setAnalytics} label="Analytics cookies" />
            </div>
            <p>Helps us understand how the site is used so we can improve it. No data is sold.</p>
          </div>

          <div className="cc-cat">
            <div className="cc-cat-head">
              <b>Marketing</b>
              <Switch checked={marketing} onChange={setMarketing} label="Marketing cookies" />
            </div>
            <p>Used to measure our campaigns and show you relevant equipment offers.</p>
          </div>
        </div>

        <div className="cc-actions">
          <button className="btn btn-primary btn-block" onClick={acceptAll}>Allow all</button>
          <div className="cc-row2">
            <button className="btn btn-line btn-block" onClick={rejectAll}>Reject all</button>
            <button className="btn btn-line btn-block" onClick={savePrefs}>Confirm my choices</button>
          </div>
        </div>
      </div>
    </div>
  );
}
