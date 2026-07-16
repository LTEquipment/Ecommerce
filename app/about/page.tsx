import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import EditorialHero from "@/components/EditorialHero";
import Customers from "@/components/Customers";
import { BRAND } from "@/lib/brand";
import { COMPANY, telHref } from "@/lib/company";
import { ArrowRight } from "@/components/icons";

export const metadata = {
  title: "About — L&T Restaurant Equipment",
  description:
    "Learn about L&T Restaurant Equipment — four decades building Panda® commercial kitchen equipment, designed, welded and line-tested in our New York factory.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <EditorialHero
        kicker="About L&T"
        title="Empowering chefs with the finest cooking equipment."
        lede={BRAND.vision}
        stats={BRAND.stats}
      >
        <Link className="btn btn-primary btn-lg" href="/products">Explore the equipment <ArrowRight /></Link>
        <Link className="btn btn-line-light btn-lg" href="/contact">Talk to our team</Link>
      </EditorialHero>

      <div className="wrap content">
        <Breadcrumbs items={[{ label: "About" }]} />

        {/* Our story */}
        <section className="pgsec" style={{ borderTop: 0, paddingTop: "var(--s2)" }}>
          <span className="pg-eyebrow">Our story</span>
          <h2>Four decades on the line, in New York.</h2>
          <p className="pg-body">{BRAND.story}</p>
          <p className="pg-body">
            Every Panda® unit is designed, welded and line-tested in New York — then shipped to the
            kitchens that depend on it, from neighborhood restaurants to national groups. Four decades
            in, we still handle each customer relationship with the same care as the first order.
          </p>
        </section>

        {/* What we stand for */}
        <span className="ss-lab">What we stand for</span>
        <div>
          {BRAND.values.map((v, i) => (
            <div className="value-row" key={v.title}>
              <div className="vr-head">
                <span className="vr-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{v.title}</h3>
              </div>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Made in New York */}
        <section className="pgsec">
          <span className="pg-eyebrow">Made in New York</span>
          <h2>Designed, built and line-tested under one roof.</h2>
          <p className="pg-body">
            The Panda® line is designed, built and line-tested in our 60,000&nbsp;sq ft New York
            factory — not imported and resold. Building and servicing our own equipment is how we hold
            it to the standards professional kitchens depend on, and every unit ships listed to the
            certifications operators require.
          </p>
          <div className="certline"><span>NSF</span><span>CSA</span><span>ETL</span><span>Energy Star</span></div>
        </section>
      </div>

      {/* Clients — logo wall */}
      <Customers label="Trusted by the kitchens you know" />

      {/* CTA */}
      <div className="wrap content">
        <section className="cta-band" style={{ borderTop: 0, marginTop: 0 }}>
          <span className="pg-eyebrow">Ready to equip?</span>
          <h2>Build your kitchen with L&amp;T.</h2>
          <p>Browse the full Panda® line, or talk to our New York team about a custom build.</p>
          <div className="hero-cta" style={{ justifyContent: "center" }}>
            <Link className="btn btn-primary btn-lg" href="/products">Explore the equipment <ArrowRight /></Link>
            <a className="btn btn-line btn-lg" href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a>
          </div>
        </section>
      </div>
    </>
  );
}
