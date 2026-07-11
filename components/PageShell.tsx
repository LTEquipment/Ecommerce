import type { ReactNode } from "react";
import Breadcrumbs from "./Breadcrumbs";
import PageHeader from "./PageHeader";
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
      <PageHeader eyebrow={eyebrow} title={title} intro={intro} meta={null} />
      <div className="doc">
        <article className="prose">{children}</article>
        <aside className="doc-aside">{aside ?? <HelpAside sections={sections} />}</aside>
      </div>
    </div>
  );
}
