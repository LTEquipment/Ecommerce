import type { ReactNode } from "react";
import Breadcrumbs from "./Breadcrumbs";

export default function PageShell({
  title,
  eyebrow,
  intro,
  children,
}: {
  title: string;
  eyebrow?: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="wrap content">
      <Breadcrumbs items={[{ label: title }]} />
      <div className="lede-head">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
      <div className="prose">{children}</div>
    </div>
  );
}
