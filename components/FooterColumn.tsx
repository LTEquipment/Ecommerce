"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "./icons";

const PHONE = "(max-width:767px)";

/**
 * Footer link group. Static column on desktop; on phones the heading becomes
 * a disclosure toggle so four stacked groups don't turn the footer into a
 * 1,300px scroll. Links stay in the DOM either way — only their visibility
 * changes — so markup is identical for crawlers and for no-JS visitors, who
 * get the expanded state.
 */
export default function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  // Only a phone renders this as a disclosure. On desktop the links are always
  // visible, so announcing aria-expanded="false" there would contradict what is
  // on screen — and CSS pointer-events can't stop keyboard activation. Tracked
  // in state rather than CSS so the ARIA matches reality, and it never gates
  // visibility, so there is no post-hydration layout shift.
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const sync = () => setIsPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const id = `fcol-${title.toLowerCase().replace(/\W+/g, "-")}`;

  return (
    <div className={`fcol${open ? " open" : ""}`}>
      <h5>
        <button
          type="button"
          className="fcol-toggle"
          aria-expanded={isPhone ? open : undefined}
          aria-controls={isPhone ? id : undefined}
          tabIndex={isPhone ? undefined : -1}
          onClick={() => setOpen((o) => !o)}
        >
          {title}
          <ChevronDown aria-hidden="true" />
        </button>
      </h5>
      <div className="fcol-links" id={id}>
        {children}
      </div>
    </div>
  );
}
