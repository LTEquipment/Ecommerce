import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeader, { StatMeta } from "@/components/PageHeader";
import { BRAND } from "@/lib/brand";
import { ArrowRight, MapPin } from "@/components/icons";

export const metadata = { title: "About — L&T Restaurant Equipment" };

export default function AboutPage() {
  return (
    <div className="wrap content">
      <Breadcrumbs items={[{ label: "About" }]} />
      <PageHeader
        eyebrow={`Panda® — ${BRAND.tagline}`}
        title="Empowering chefs with the finest cooking equipment."
        intro={BRAND.vision}
        meta={<StatMeta n="40+" label="years in New York" />}
      />

      <div className="doc">
        <article className="prose">
          <p>{BRAND.story}</p>
          <p>
            Every Panda® unit is designed, welded and line-tested in New York — then shipped to the
            kitchens that depend on it, from neighborhood restaurants to national groups. Four decades
            in, we still handle each customer relationship with the same care as the first order.
          </p>
        </article>
        <aside className="doc-aside">
          <div className="side-card">
            <h4 style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <MapPin style={{ width: 16, height: 16, color: "var(--red)" }} /> Made in New York
            </h4>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55, margin: "0 0 4px" }}>
              Designed, built and line-tested in our 60,000&nbsp;sq ft factory.
            </p>
            <div className="certline"><span>NSF</span><span>CSA</span><span>ETL</span><span>Energy Star</span></div>
          </div>
        </aside>
      </div>

      <div className="band about" style={{ borderRadius: "var(--rl)", border: "1px solid var(--line)" }}>
        <div className="wrap" style={{ padding: "var(--s6) var(--s5)" }}>
          <div>
            <span className="eyebrow">By the numbers</span>
            <h2 style={{ margin: "10px 0 0" }}>Four decades on the line.</h2>
          </div>
          <div className="stats">
            {BRAND.stats.map((s) => (
              <div className="s" key={s.label}><div className="n">{s.value}</div><div className="l">{s.label}</div></div>
            ))}
          </div>
        </div>
      </div>

      <section className="section">
        <div className="sec-head"><h2>Trusted by the kitchens you know</h2></div>
        <div className="clientwall">{BRAND.clients.map((c) => (<span key={c}>{c}</span>))}</div>
      </section>

      <div className="ir-callout" style={{ marginBottom: "var(--s4)" }}>
        <div>
          <span className="eyebrow">Ready to equip?</span>
          <h3>Build your kitchen with L&amp;T.</h3>
          <p>Browse the full Panda® line, or talk to our New York team about a custom build.</p>
        </div>
        <Link className="btn" href="/products">Explore the equipment <ArrowRight /></Link>
      </div>
    </div>
  );
}
