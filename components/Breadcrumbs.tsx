import Link from "next/link";

export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      {items.map((c, i) => (
        <span key={i} style={{ display: "contents" }}>
          <span className="sep">/</span>
          {c.href ? <Link href={c.href}>{c.label}</Link> : <span className="cur">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}
