import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BRAND } from "@/lib/brand";
import { COMPANY, telHref } from "@/lib/company";
import { TrendingUp, ArrowRight, FileText, Shield, Package } from "@/components/icons";

export const metadata = { title: "Investor Relations — L&T Restaurant Equipment" };

const HIGHLIGHTS = [
  { value: "40+", label: "Years of profitable operation" },
  { value: "60,000", label: "Sq ft of NYC manufacturing" },
  { value: "10", label: "Product departments" },
  { value: "40+", label: "Marquee restaurant-group clients" },
];

const THESIS = [
  { icon: Package, title: "A manufacturing moat", desc: "Vertically integrated, Made-in-New-York production of the Panda® line — proprietary wok chambers and burners competitors import and resell." },
  { icon: TrendingUp, title: "Durable, expanding demand", desc: "A growing national footprint serving multi-unit operators, universities and hospitality groups, with recurring parts, service and refit revenue." },
  { icon: Shield, title: "Trusted, certified brand", desc: "Four decades of relationships and NSF / CSA / ETL-listed equipment behind kitchens like Panda Express, Din Tai Fung and Hai Di Lao." },
];

export default function InvestorsPage() {
  return (
    <div className="wrap content">
      <Breadcrumbs items={[{ label: "Investor Relations" }]} />

      <div className="lede-head">
        <span className="eyebrow">
          <TrendingUp style={{ width: 14, height: 14, display: "inline", verticalAlign: "-2px", marginRight: 6 }} />
          Investor Relations
        </span>
        <h1>Building L&amp;T for the public markets.</h1>
        <p>
          For over 40 years, L&amp;T Restaurant Equipment has designed and manufactured the Panda®
          line in New York. As we prepare for our next chapter — including a public listing — this
          is where we&apos;ll share our story, performance and governance with prospective investors.
        </p>
        <div className="hero-cta" style={{ marginTop: "var(--s4)" }}>
          <Link className="btn btn-primary btn-lg" href="/contact"><FileText /> Contact IR</Link>
          <Link className="btn btn-line btn-lg" href="/about">Read our story <ArrowRight /></Link>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: "var(--s4)" }}>
          This page is a concept and does not constitute an offer to sell or a solicitation of an
          offer to buy any securities.
        </p>
      </div>

      {/* Highlights */}
      <section id="highlights" style={{ padding: "var(--s5) 0" }}>
        <div className="sec-head"><h2>Company highlights</h2></div>
        <div className="band" style={{ border: "1px solid var(--line)", borderRadius: "var(--rl)" }}>
          <div className="wrap" style={{ padding: "var(--s5)", gridTemplateColumns: "1fr" }}>
            <div className="stats" style={{ marginTop: 0, gridTemplateColumns: "repeat(4,1fr)" }}>
              {HIGHLIGHTS.map((s) => (
                <div className="s" key={s.label}>
                  <div className="n">{s.value}</div>
                  <div className="l">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Investment thesis */}
      <section style={{ padding: "var(--s4) 0" }}>
        <div className="sec-head"><h2>Why L&amp;T</h2></div>
        <div className="valuegrid" style={{ margin: 0 }}>
          {THESIS.map((t) => {
            const Icon = t.icon;
            return (
              <div className="valuecard" key={t.title}>
                <Icon style={{ width: 22, height: 22, color: "var(--red)", marginBottom: 10 }} />
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Governance */}
      <section id="governance" style={{ padding: "var(--s5) 0" }}>
        <div className="sec-head"><h2>Corporate governance</h2></div>
        <div className="prose">
          <p>
            L&amp;T is a founder-led company committed to the standards expected of a public issuer.
            Ahead of listing we are formalizing our board, audit and compensation practices and will
            publish our governance framework, leadership and financial reporting here as they become
            available.
          </p>
        </div>
        <div className="clientwall" style={{ marginTop: "var(--s4)" }}>
          {["Board of Directors", "Audit Committee", "Code of Conduct", "Financial reporting", "Leadership team"].map((g) => (
            <span key={g}>{g}</span>
          ))}
        </div>
      </section>

      {/* Contact IR */}
      <div className="ir-callout" style={{ marginTop: "var(--s5)", marginBottom: "var(--s4)" }}>
        <div>
          <span className="eyebrow">Investor inquiries</span>
          <h3>Talk to Investor Relations.</h3>
          <p>For partnership, pre-IPO and investment inquiries, reach our team directly.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <a className="btn" href={`mailto:${COMPANY.email}`} style={{ background: "#fff", color: "var(--ink)" }}>{COMPANY.email}</a>
          <a className="btn btn-line" href={telHref(COMPANY.mainPhone)} style={{ borderColor: "rgba(255,255,255,.3)", color: "#fff" }}>{COMPANY.mainPhone}</a>
        </div>
      </div>

      <section style={{ paddingTop: 0 }}>
        <div className="sec-head"><h2>Trusted by the kitchens you know</h2></div>
        <div className="clientwall">
          {BRAND.clients.map((c) => (<span key={c}>{c}</span>))}
        </div>
      </section>
    </div>
  );
}
