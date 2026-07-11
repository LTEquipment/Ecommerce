"use client";

import { OPEN_EVENT } from "./CookieConsent";

/** Footer link that reopens the cookie preferences panel. */
export default function CookiePrefsButton() {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      Cookie preferences
    </button>
  );
}
