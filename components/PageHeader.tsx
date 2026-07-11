import type { ReactNode } from "react";
import { COMPANY, telHref } from "@/lib/company";
import { Phone } from "./icons";

/** Default right-side element: a spec-support call chip. */
function CallMeta() {
  return (
    <a className="ph-call" href={telHref(COMPANY.mainPhone)}>
      <Phone />
      <span className="ph-call-t">
        <b>{COMPANY.mainPhone}</b>
        <small>Spec support &amp; quotes</small>
      </span>
    </a>
  );
}

/** A big-number stat for the header's right side. */
export function StatMeta({ n, label, sub }: { n: string | number; label: string; sub?: string }) {
  return (
    <div className="ph-stat">
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
  /** Right-side element. Defaults to a call chip. Pass null to omit. */
  meta?: ReactNode;
  /** Extra left-column content below the intro (e.g. CTAs). */
  children?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="ph-main">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
        {children}
      </div>
      {meta !== null && <div className="ph-meta">{meta ?? <CallMeta />}</div>}
    </header>
  );
}
