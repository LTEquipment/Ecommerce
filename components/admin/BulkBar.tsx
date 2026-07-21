"use client";

import type { ReactNode } from "react";

/**
 * Contextual action bar for an admin list: appears only while rows are
 * selected, states the count, and carries the actions that apply to them.
 * Actions are supplied by the panel so this stays list-agnostic.
 */
export default function BulkBar({
  count,
  noun,
  onClear,
  children,
  busy,
}: {
  count: number;
  /** Singular noun for the rows, e.g. "order". Pluralised with a trailing s. */
  noun: string;
  onClear: () => void;
  /** Action buttons. */
  children: ReactNode;
  busy?: boolean;
}) {
  if (count === 0) return null;
  return (
    <div className="bulkbar" role="region" aria-label={`${count} ${noun}${count === 1 ? "" : "s"} selected`}>
      <div className="bulkbar-in">
        <span className="bulkbar-count" aria-live="polite">
          <b>{count}</b> {noun}
          {count === 1 ? "" : "s"} selected
        </span>
        <div className="bulkbar-actions" aria-busy={busy || undefined}>
          {children}
          <button type="button" className="bulkbar-clear" onClick={onClear} disabled={busy}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
