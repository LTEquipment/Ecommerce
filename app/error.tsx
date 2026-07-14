"use client";

import { useEffect } from "react";
import Link from "next/link";
import { COMPANY, telHref } from "@/lib/company";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log for observability. Wire to Sentry/logging in production.
    // We never render error.message to the user — it can leak internals.
    console.error(error);
  }, [error]);

  return (
    <div className="wrap content nf">
      <div className="nf-main">
        <div className="nf-num" aria-hidden="true">500</div>
        <span className="eyebrow">Something went wrong</span>
        <h1>We hit an unexpected error.</h1>
        <p>
          Sorry about that. You can try again, or head back home. If it keeps happening,
          our team is one call away.
        </p>
        <div className="nf-cta">
          <button className="btn btn-primary btn-lg" onClick={reset}>Try again</button>
          <Link className="btn btn-line btn-lg" href="/">Back to home</Link>
        </div>
        <a className="nf-tel" href={telHref(COMPANY.mainPhone)}>
          <small>Spec support &amp; quotes</small>
          <b>{COMPANY.mainPhone}</b>
        </a>
        {error?.digest && <p className="nf-digest">Reference: {error.digest}</p>}
      </div>
    </div>
  );
}
