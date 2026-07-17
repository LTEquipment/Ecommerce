import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import EditorialHero from "@/components/EditorialHero";
import Customers from "@/components/Customers";
import { BRAND } from "@/lib/brand";
import { COMPANY, telHref } from "@/lib/company";
import { getSiteSettings } from "@/lib/settings";
import { ArrowRight, FileText } from "@/components/icons";

export const metadata = {
  title: "Investor Relations — L&T Restaurant Equipment",
  description:
    "Investor relations for L&T Restaurant Equipment — company overview, operating highlights, corporate governance and how to reach our IR team.",
  alternates: { canonical: "/investors" },
};

const HIGHLIGHTS = [
  { value: "40+", label: "Years of profitable operation" },
  { value: "60,000", label: "Sq ft of NYC manufacturing" },
  { value: "10", label: "Product departments" },
  { value: "40+", label: "Marquee restaurant-group clients" },
];

const THESIS = [
  {
    title: "A manufacturing moat",
    desc: "Vertically integrated, Made-in-New-York production of the Panda® line — proprietary wok chambers and burners competitors import and resell.",
  },
  {
    title: "Durable, expanding demand",
    desc: "A growing national footprint serving multi-unit operators, universities and hospitality groups, with recurring parts, service and refit revenue.",
  },
  {
    title: "Trusted, certified brand",
    desc: "Four decades of relationships and NSF / CSA / ETL-listed equipment behind kitchens like Panda Express, Din Tai Fung and Hai Di Lao.",
  },
];

const GOVERNANCE = ["Board of Directors", "Audit Committee", "Code of Conduct", "Financial reporting", "Leadership team"];

const IR_NAV = [
  { href: "#overview", label: "Overview" },
  { href: "#highlights", label: "Highlights" },
  { href: "#story", label: "Equity story" },
  { href: "#governance", label: "Governance" },
  { href: "#news", label: "News" },
  { href: "#contact", label: "Contact" },
];

export default async function InvestorsPage() {
  const { investorRelationsEnabled } = await getSiteSettings();
  if (!investorRelationsEnabled) notFound();

  return (
    <>
      <EditorialHero
        kicker="Investor Relations"
        title="Building L&T for the public markets."
        lede="For over 40 years, L&T Restaurant Equipment has designed and manufactured the Panda® line in New York. As we prepare for our next chapter — including a public listing — this is where we share our story, performance and governance with prospective investors."
        stats={HIGHLIGHTS}
      >
        <Link className="btn btn-primary btn-lg" href="#contact"><FileText /> Contact IR</Link>
        <Link className="btn btn-line-light btn-lg" href="/about">Read our story <ArrowRight /></Link>
      </EditorialHero>

      <nav className="ir-nav" aria-label="Investor relations sections">
        <div className="wrap ir-nav-in">
          {IR_NAV.map((n) => (
            <a key={n.href} href={n.href}>{n.label}</a>
          ))}
        </div>
      </nav>

      <div className="wrap content" style={{ paddingTop: "var(--s6)" }}>
        <Breadcrumbs items={[{ label: "Investor Relations" }]} />

        {/* Corporate overview */}
        <section id="overview" className="ir-sec pgsec" style={{ borderTop: 0, paddingTop: "var(--s2)" }}>
          <span className="pg-eyebrow">Corporate overview</span>
          <h2>A founder-led manufacturer, not a middleman.</h2>
          <p className="pg-body">
            L&amp;T Restaurant Equipment has served professional kitchens for over 40 years — from the
            first contact to the end of a product&apos;s lifetime — with the same care as the first
            order. Our Panda® brand of wok ranges, steamers, roasters and automation is designed,
            developed and produced in America across a 60,000+ sq ft manufacturing operation, with
            showrooms throughout New York City.
          </p>
          <p className="pg-body">
            We build equipment competitors import and resell, and we service it locally — a vertically
            integrated model that has compounded four decades of durable customer relationships. As we
            prepare for our next chapter, including a public listing, this page will carry our
            performance, governance and reporting to prospective investors.
          </p>
        </section>

        {/* Company highlights */}
        <section id="highlights" className="ir-sec">
          <span className="ss-lab">Company highlights</span>
          <div className="ss-data">
            {HIGHLIGHTS.map((s) => (
              <div className="d" key={s.label}>
                <div className="n">{s.value}</div>
                <div className="l">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Equity story */}
        <section id="story" className="ir-sec">
          <span className="ss-lab">The equity story</span>
          <div>
            {THESIS.map((t, i) => (
              <div className="value-row" key={t.title}>
                <div className="vr-head">
                  <span className="vr-num">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{t.title}</h3>
                </div>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Corporate governance */}
        <section id="governance" className="ir-sec pgsec">
          <span className="pg-eyebrow">Corporate governance</span>
          <h2>Built to public-company standards.</h2>
          <p className="pg-body">
            L&amp;T is a founder-led company committed to the standards expected of a public issuer.
            Ahead of listing we are formalizing our board, audit and compensation practices, and will
            publish financial reporting and filings here as they become available. See our{" "}
            <Link href="/supply-chain">supply chain transparency</Link> disclosure for our current
            reporting.
          </p>
          <div className="gov-list">
            {GOVERNANCE.map((g) => (
              <span key={g}>{g}</span>
            ))}
          </div>
        </section>

        {/* Latest news */}
        <section id="news" className="ir-sec">
          <div className="ss-head-row">
            <span className="ss-lab" style={{ paddingTop: "var(--s8)" }}>Latest news</span>
            <Link href="/press">All news <ArrowRight /></Link>
          </div>
          <div className="ir-news">
            {BRAND.milestones.map((m) => (
              <article className="ir-news-item" key={m.text}>
                <span className="ir-news-date">{m.year}</span>
                <h3>{m.text}</h3>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* Clients — logo wall */}
      <Customers label="Trusted by the kitchens you know" />

      {/* Investor contact */}
      <div className="wrap content">
        <section id="contact" className="ir-sec cta-band" style={{ borderTop: 0, marginTop: 0 }}>
          <span className="pg-eyebrow">Investor contact</span>
          <h2>Talk to Investor Relations.</h2>
          <p>
            For partnership, pre-IPO and investment inquiries, reach our Investor Relations team
            directly at <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
          </p>
          <div className="hero-cta" style={{ justifyContent: "center" }}>
            <a className="btn btn-primary btn-lg" href={`mailto:${COMPANY.email}?subject=Investor%20inquiry`}>Contact IR</a>
            <a className="btn btn-line btn-lg" href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a>
          </div>
        </section>
      </div>
    </>
  );
}
