"use client";

import { OPEN_EVENT } from "./CookieConsent";

/**
 * "Your Privacy Choices" opt-out link (the standardized CCPA/CPRA toggle mark).
 * Reopens the privacy preferences panel.
 */
export default function CookiePrefsButton() {
  return (
    <button
      type="button"
      className="privacy-choices"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
    >
      <svg className="pc-icon" viewBox="0 0 32 16" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="pcPill">
            <rect x="1" y="1" width="30" height="14" rx="7" />
          </clipPath>
        </defs>
        {/* white pill with blue outline */}
        <rect x="1" y="1" width="30" height="14" rx="7" fill="#fff" stroke="#1A73E8" strokeWidth="1.4" />
        {/* right half filled blue, clipped to the pill so its end stays rounded */}
        <rect x="16" y="1" width="15" height="14" fill="#1A73E8" clipPath="url(#pcPill)" />
        {/* blue check on the white (left) side */}
        <path d="M5.3 8.2 L7.6 10.5 L11.4 5.7" fill="none" stroke="#1A73E8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {/* white X on the blue (right) side */}
        <path d="M21 5.7 L26 10.4 M26 5.7 L21 10.4" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span>Your Privacy Choices</span>
    </button>
  );
}
