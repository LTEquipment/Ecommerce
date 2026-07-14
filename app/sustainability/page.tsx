import Link from "next/link";
import { COMPANY, telHref } from "@/lib/company";
import { ArrowRight } from "@/components/icons";

export const metadata = { title: "Sustainability — L&T Restaurant Equipment" };

const DATA = [
  { value: "40+", label: "Years building to last" },
  { value: "60,000", label: "Sq ft · one NY factory" },
  { value: "30+", label: "Years on the same line" },
  { value: "R-290", label: "Natural refrigerant" },
];

const PRINCIPLES = [
  {
    n: "01",
    title: "Built to last",
    kicker: "Longevity",
    desc: "The most sustainable equipment is the equipment you don't replace. Panda® ranges are heavy-gauge stainless steel with serviceable, repairable components — engineered for decades of daily service, not disposable cycles.",
  },
  {
    n: "02",
    title: "Made in New York",
    kicker: "Local manufacturing",
    desc: "Vertically integrated, made-in-America production means shorter supply chains and a smaller shipping footprint than equipment imported and resold — with parts and service that keep units running for years.",
  },
  {
    n: "03",
    title: "Energy-efficient by design",
    kicker: "Efficiency",
    desc: "Energy Star–qualified models, high-efficiency jet burners and induction options, and R-290 natural-refrigerant refrigeration cut the fuel, power and global-warming potential of a working kitchen.",
  },
  {
    n: "04",
    title: "Materials & end of life",
    kicker: "Circularity",
    desc: "Stainless steel is fully recyclable at end of life, modular parts extend a unit's service life, and factory parts and service keep equipment running rather than landfilled.",
  },
];

export default function SustainabilityPage() {
  return (
    <>
      {/* Full-bleed, bottom-left editorial video hero */}
      <section className="pg-hero">
        <video className="pg-hero-bg" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
          <source src="/videos/sustainability.mp4" type="video/mp4" />
        </video>
        <div className="wrap pg-hero-inner">
          <span className="eyebrow">Built to last</span>
          <h1>Sustainability</h1>
          <p className="pg-hero-lede">
            The most sustainable equipment is the equipment that lasts — built to run for decades,
            made close to the kitchens it serves, and engineered to use less energy on every line.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary btn-lg" href="/products">Explore the equipment <ArrowRight /></Link>
            <Link className="btn btn-line-light btn-lg" href="/contact">Talk to our team</Link>
          </div>
        </div>
      </section>

      <div className="wrap content" style={{ paddingTop: 0 }}>
        {/* Editorial intro — statement left, note right */}
        <section className="ss-intro">
          <h2>Durability is the strategy.</h2>
          <p>
            We don&apos;t bolt sustainability on. It&apos;s a consequence of how L&amp;T has built
            commercial kitchen equipment in New York for over 40 years — machines that stay in
            service for decades, produced locally with less waste, and engineered to burn less energy
            every day.
          </p>
        </section>

        {/* Technical data strip */}
        <div className="ss-data">
          {DATA.map((d) => (
            <div className="d" key={d.label}>
              <div className="n">{d.value}</div>
              <div className="l">{d.label}</div>
            </div>
          ))}
        </div>

        {/* Numbered principles index */}
        <span className="ss-lab">Four principles</span>
        <div>
          {PRINCIPLES.map((p) => (
            <section className="principle" key={p.n}>
              <div className="principle-num">{p.n}</div>
              <div>
                <h2 className="principle-title">{p.title}</h2>
                <span className="principle-kicker">{p.kicker}</span>
              </div>
              <p className="principle-desc">{p.desc}</p>
            </section>
          ))}
        </div>

        {/* Reporting */}
        <section className="pgsec">
          <span className="pg-eyebrow">Reporting &amp; goals</span>
          <h2>Measured, not marketed.</h2>
          <p className="pg-body">
            As we prepare for our next chapter — including a public listing — we&apos;re formalizing
            our environmental reporting alongside our governance framework. We will publish
            measurable targets and progress here as they are set, rather than make claims we
            can&apos;t yet stand behind. For governance and investor detail, see{" "}
            <Link href="/investors#governance">corporate governance</Link>.
          </p>
        </section>

        {/* CTA */}
        <section className="cta-band">
          <h2>Building or refitting a kitchen?</h2>
          <p>Our New York team can help you spec durable, energy-efficient equipment for your line.</p>
          <div className="hero-cta" style={{ justifyContent: "center" }}>
            <a className="btn btn-primary btn-lg" href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a>
            <Link className="btn btn-line btn-lg" href="/contact">Contact us <ArrowRight /></Link>
          </div>
        </section>
      </div>
    </>
  );
}
