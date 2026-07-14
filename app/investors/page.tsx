import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import EditorialHero from "@/components/EditorialHero";
import { BRAND } from "@/lib/brand";
import { COMPANY, telHref } from "@/lib/company";
import { ArrowRight, FileText } from "@/components/icons";

export const metadata = { title: "Investor Relations — L&T Restaurant Equipment" };

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

export default function InvestorsPage() {
  return (
    <>
      <EditorialHero
        kicker="Investor Relations"
        title="Building L&T for the public markets."
        lede="For over 40 years, L&T Restaurant Equipment has designed and manufactured the Panda® line in New York. As we prepare for our next chapter — including a public listing — this is where we share our story, performance and governance with prospective investors."
        stats={HIGHLIGHTS}
      >
        <Link className="btn btn-primary btn-lg" href="/contact"><FileText /> Contact IR</Link>
        <Link className="btn btn-line-light btn-lg" href="/about">Read our story <ArrowRight /></Link>
      </EditorialHero>

      <div className="wrap content" style={{ paddingTop: "var(--s5)" }}>
        <Breadcrumbs items={[{ label: "Investor Relations" }]} />
        <p className="ed-note">
          This page contains forward-looking information and does not constitute an offer to sell,
          or a solicitation of an offer to buy, any securities.
        </p>

        {/* Company highlights — flat data band */}
        <section id="highlights">
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

        {/* Investment thesis — indexed editorial rows */}
        <span className="ss-lab">The investment thesis</span>
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

        {/* Corporate governance */}
        <section id="governance" className="pgsec">
          <span className="pg-eyebrow">Corporate governance</span>
          <h2>Built to public-company standards.</h2>
          <p className="pg-body">
            L&amp;T is a founder-led company committed to the standards expected of a public issuer.
            Ahead of listing we are formalizing our board, audit and compensation practices, and will
            publish our governance framework, leadership and financial reporting here as they become
            available.
          </p>
          <div className="gov-list">
            {GOVERNANCE.map((g) => (
              <span key={g}>{g}</span>
            ))}
          </div>
        </section>

        {/* Clients — flat directory */}
        <span className="ss-lab">Trusted by the kitchens you know</span>
        <div className="client-list">
          {BRAND.clients.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>

        {/* Contact IR */}
        <section className="cta-band">
          <span className="pg-eyebrow">Investor inquiries</span>
          <h2>Talk to Investor Relations.</h2>
          <p>For partnership, pre-IPO and investment inquiries, reach our team directly.</p>
          <div className="hero-cta" style={{ justifyContent: "center" }}>
            <a className="btn btn-primary btn-lg" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            <a className="btn btn-line btn-lg" href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a>
          </div>
        </section>
      </div>
    </>
  );
}
