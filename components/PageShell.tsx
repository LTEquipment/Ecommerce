import type { ReactNode } from "react";
import Breadcrumbs from "./Breadcrumbs";
import HelpAside, { type TocItem } from "./HelpAside";

export default function PageShell({
  title,
  eyebrow,
  intro,
  aside,
  sections,
  children,
}: {
  title: string;
  eyebrow?: string;
  intro?: string;
  /** Override the default help card in the right rail. */
  aside?: ReactNode;
  /** When set, renders an "On this page" TOC above the help card. */
  sections?: TocItem[];
  children: ReactNode;
}) {
  return (
    <div className="wrap content">
      <Breadcrumbs items={[{ label: title }]} />
      <header className="page-header">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </header>
      <div className="doc">
        <article className="prose">{children}</article>
        <aside className="doc-aside">{aside ?? <HelpAside sections={sections} />}</aside>
      </div>
    </div>
  );
}
