import type { ReactNode } from "react";
import { COMPANY, telHref } from "@/lib/company";
import { Phone } from "./icons";

/** Spec-support call chip (styled for the dark hero). */
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

/** A big-number stat for the hero. */
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
  image,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  /** Facts/CTA element shown under the intro. Pass a CallMeta by default. */
  meta?: ReactNode;
  /** Optional product/photo shown in a card on the right (catalog pages). */
  image?: string;
  /** Extra content under the intro (e.g. CTAs), above meta. */
  children?: ReactNode;
}) {
  const showCall = meta === undefined && !children;
  return (
    <header className={`page-hero${image ? "" : " no-visual"}`}>
      <div className="page-hero-inner">
        <div className="ph-text">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {intro && <p>{intro}</p>}
          {children}
          {(meta || showCall) && <div className="ph-foot">{meta ?? <CallMeta />}</div>}
        </div>
        {image && (
          <div className="ph-visual">
            <img src={image} alt="" />
          </div>
        )}
      </div>
    </header>
  );
}
