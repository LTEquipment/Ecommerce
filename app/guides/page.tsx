import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeader from "@/components/PageHeader";
import { GUIDES } from "@/lib/guides";
import { ArrowRight } from "@/components/icons";

export const metadata = {
  title: "Equipment Guides — L&T Restaurant Equipment",
  description:
    "Buyer guides for commercial kitchen equipment — choosing wok ranges, NSF/CSA/ETL certifications, sizing steamers, gas vs. electric, freight and installation. From L&T's New York team.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <div className="wrap content">
      <Breadcrumbs items={[{ label: "Guides" }]} />
      <PageHeader
        eyebrow="Learn"
        title="Equipment guides"
        intro="Practical guidance on speccing, certifying and installing commercial kitchen equipment — from the team that designs and builds it in New York."
        meta={null}
      />
      <div className="guide-grid">
        {GUIDES.map((g) => (
          <Link className="guide-card" href={`/guides/${g.slug}`} key={g.slug}>
            <span className="guide-cat">{g.category}</span>
            <h2>{g.title}</h2>
            <p>{g.excerpt}</p>
            <span className="guide-more">Read guide <ArrowRight /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
