"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Route-level error boundary for /admin. A render-time throw in any panel lands
 * here (inside the admin language) with a Try-again reset, instead of blowing up
 * to the global error page and losing the whole console.
 */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // surface for debugging; the audit log is not the place for render crashes
    console.error("[admin] panel crashed:", error);
  }, [error]);

  return (
    <div className="admin-gate">
      <div className="card">
        <h1>Something went wrong</h1>
        <p className="sub">A part of the console failed to load. This is usually temporary — try again.</p>
        <div className="admin-err-actions">
          <button className="btn btn-primary" onClick={() => reset()}>Try again</button>
          <Link className="btn btn-line" href="/admin">Back to console</Link>
        </div>
      </div>
    </div>
  );
}
