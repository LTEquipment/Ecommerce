import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import GuideBody from "@/components/GuideBody";
import JsonLd from "@/components/JsonLd";
import { getGuide, GUIDES } from "@/lib/guides";
import { articleLd, breadcrumbLd } from "@/lib/seo";
import { COMPANY, telHref } from "@/lib/company";
import { ArrowRight } from "@/components/icons";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return { title: "Guide — L&T" };
  return {
    title: `${g.title} — L&T`,
    description: g.metaDescription,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: { type: "article", title: g.title, description: g.metaDescription, url: `/guides/${g.slug}` },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();

  return (
    <>
      <div className="wrap content">
        <JsonLd
          data={[
            articleLd(g),
            breadcrumbLd([{ name: "Home", url: "/" }, { name: "Guides", url: "/guides" }, { name: g.title }]),
          ]}
        />
        <Breadcrumbs items={[{ label: "Guides", href: "/guides" }, { label: g.title }]} />

        <article className="guide">
          <span className="guide-cat">{g.category} · {g.readMins} min read</span>
          <h1>{g.title}</h1>
          <p className="guide-lede">{g.excerpt}</p>
          <div className="prose guide-prose">
            <GuideBody body={g.body} />
          </div>

          {g.related.length > 0 && (
            <div className="guide-related">
              <span className="ss-lab">Related</span>
              <div className="guide-related-links">
                {g.related.map((r) => (
                  <Link key={r.href + r.label} href={r.href}>{r.label} <ArrowRight /></Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

      <section className="guide-cta">
        <div className="wrap">
          <span className="pg-eyebrow">Speccing a kitchen?</span>
          <h2>Talk to our New York team.</h2>
          <p>We&apos;ll help you spec the right equipment, gas type, freight and custom options.</p>
          <div className="hero-cta">
            <a className="btn btn-primary btn-lg" href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a>
            <Link className="btn btn-line btn-lg" href="/contact">Contact us <ArrowRight /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
