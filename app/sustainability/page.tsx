import Link from "next/link";
import { COMPANY, telHref } from "@/lib/company";
import { ArrowRight } from "@/components/icons";

export const metadata = { title: "Sustainability — L&T Restaurant Equipment" };

const STATS = [
  { value: "40+", label: "Years building equipment made to last" },
  { value: "60,000", label: "Sq ft — a single New York factory" },
  { value: "30+", label: "Years many customers run the same line" },
  { value: "R-290", label: "Natural-refrigerant refrigeration" },
];

const FEATURES = [
  {
    kicker: "Longevity",
    title: "Built to last",
    img: "/products/52527-1.png",
    desc: "The most sustainable equipment is the equipment you don't replace. Panda® ranges are heavy-gauge stainless steel with serviceable, repairable components — engineered for decades of daily service, not disposable cycles.",
  },
  {
    kicker: "Local manufacturing",
    title: "Made in New York",
    img: "/products/52740-1.jpg",
    desc: "Vertically integrated, made-in-America manufacturing means shorter supply chains and a smaller shipping footprint than equipment imported and resold — and parts and service that keep units running for years.",
  },
  {
    kicker: "Efficiency",
    title: "Energy-efficient by design",
    img: "/products/ind-e120v-1.jpg",
    desc: "Energy Star–qualified models, high-efficiency jet burners and induction options, and R-290 natural-refrigerant refrigeration reduce the fuel, power and global-warming potential of a working kitchen.",
  },
  {
    kicker: "Circularity",
    title: "Materials & end of life",
    img: "/products/dchpa48-1.jpg",
    desc: "Stainless steel is fully recyclable at end of life, modular and interchangeable parts extend a unit's service life, and factory parts and service keep equipment running rather than landfilled.",
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
        {/* Opening statement */}
        <section className="stmt">
          <h2>The most sustainable equipment is the one you don&apos;t replace.</h2>
          <p>
            We&apos;ve built commercial kitchen equipment in New York for over 40 years — durable
            machines that stay in service for decades, produced locally with less waste, and
            engineered to cut the energy a kitchen burns every day.
          </p>
        </section>

        {/* Bold stats */}
        <div className="pg-stats">
          {STATS.map((s) => (
            <div className="s" key={s.label}>
              <div className="n">{s.value}</div>
              <div className="l">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Alternating product-feature rows */}
        {FEATURES.map((f) => (
          <section className="featrow" key={f.title}>
            <div className="featrow-media">
              <img src={f.img} alt={f.title} loading="lazy" decoding="async" />
            </div>
            <div className="featrow-text">
              <span className="featrow-kicker">{f.kicker}</span>
              <h2>{f.title}</h2>
              <p>{f.desc}</p>
            </div>
          </section>
        ))}

        {/* Reporting & goals — honest, no invented metrics */}
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
