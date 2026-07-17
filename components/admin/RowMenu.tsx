"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreVertical } from "../icons";

/**
 * A compact per-row overflow (⋯) menu for admin tables. Keeps rows uniform when
 * there are several actions, instead of a wrapping wall of buttons. Children are
 * the menu items (buttons with class "rowmenu-item"); the menu closes on item
 * click, outside click, or Escape.
 */
export default function RowMenu({ label = "Actions", children }: { label?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`rowmenu${open ? " open" : ""}`} ref={ref}>
      <button
        type="button"
        className="rowmenu-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
      >
        <MoreVertical />
      </button>
      {open && (
        // Close after any item fires (the item's onClick runs first, then bubbles here).
        <div className="rowmenu-pop" role="menu" onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}
