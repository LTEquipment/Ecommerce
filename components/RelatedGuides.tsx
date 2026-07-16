import Link from "next/link";
import { relatedGuides } from "@/lib/guideLinks";

/** Server component: links a category/product page into the most relevant guides. */
export default function RelatedGuides({ query, heading = "Related guides" }: { query: string; heading?: string }) {
  const guides = relatedGuides(query, 3);
  if (guides.length === 0) return null;
  return (
    <section className="rel-guides wrap">
      <div className="rel-guides-head">
        <h2>{heading}</h2>
        <Link href="/guides" className="link-arrow">All guides →</Link>
      </div>
      <div className="rel-guides-grid">
        {guides.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="rel-guide-card">
            <span className="rel-guide-cat">{g.category}</span>
            <span className="rel-guide-title">{g.title}</span>
            <span className="rel-guide-ex">{g.excerpt.slice(0, 120)}…</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
