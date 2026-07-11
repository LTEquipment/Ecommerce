import type { ReactNode } from "react";
import { COMPANY, telHref } from "@/lib/company";

/** Right-side spec-support line (label over bold phone). */
function CallLine() {
  return (
    <a className="phead-call" href={telHref(COMPANY.mainPhone)}>
      <small>Spec support &amp; quotes</small>
      <b>{COMPANY.mainPhone}</b>
    </a>
  );
}

/** Big-number stat for the header's right side. */
export function StatMeta({ n, label, sub }: { n: string | number; label: string; sub?: string }) {
  return (
    <div className="phead-stat">
      <b>{n}</b>
      <span>{label}{sub ? ` · ${sub}` : ""}</span>
    </div>
  );
}

export default function PageHeader({
  eyebrow,
  title,
  intro,
  meta,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  /** Right-side content. Omit for a default call line; pass null for no right column. */
  meta?: ReactNode;
  /** Extra left-column content under the intro (e.g. CTAs). */
  children?: ReactNode;
}) {
  const hasSide = meta !== null;
  return (
    <header className={`phead${hasSide ? "" : " no-side"}`}>
      <div className="phead-main">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
        {children}
      </div>
      {hasSide && (
        <div className="phead-side">
          {meta}
          <CallLine />
        </div>
      )}
    </header>
  );
}
