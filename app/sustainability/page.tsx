import Link from "next/link";
import { COMPANY, telHref } from "@/lib/company";
import { Wrench, Shield, TrendingUp, Package, ArrowRight } from "@/components/icons";

export const metadata = { title: "Sustainability — L&T Restaurant Equipment" };

const STATS = [
  { value: "40+", label: "Years building equipment made to last" },
  { value: "60,000", label: "Sq ft — a single New York factory" },
  { value: "30+", label: "Years many customers run the same line" },
  { value: "R-290", label: "Natural-refrigerant refrigeration" },
];

const PILLARS = [
  {
    icon: Wrench,
    title: "Built to last",
    desc: "The most sustainable equipment is the equipment you don't replace. Panda® ranges are heavy-gauge stainless steel with serviceable, repairable components — engineered for decades of daily service, not disposable cycles.",
  },
  {
    icon: Shield,
    title: "Made in New York",
    desc: "Vertically integrated, made-in-America manufacturing means shorter supply chains and a smaller shipping footprint than equipment imported and resold — and parts and service that keep units running.",
  },
  {
    icon: TrendingUp,
    title: "Energy-efficient by design",
    desc: "Energy Star–qualified models, high-efficiency jet burners and induction options, and R-290 natural-refrigerant refrigeration reduce the fuel, power and global-warming potential of a working kitchen.",
  },
  {
    icon: Package,
    title: "Materials & circularity",
    desc: "Stainless steel is fully recyclable at end of life, modular and interchangeable parts extend a unit's service life, and factory parts and service keep equipment out of the landfill.",
  },
];

export default function SustainabilityPage() {
  return (
    <>
      {/* Full-bleed video hero */}
      <section className="vhero">
        <video className="vhero-bg" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
          <source src="/videos/sustainability.mp4" type="video/mp4" />
        </video>
        <div className="vhero-scrim" />
        <div className="wrap vhero-inner">
          <span className="eyebrow">Built to last</span>
          <h1>Sustainability</h1>
          <p className="vhero-lede">
            The most sustainable equipment is the equipment that lasts — built to run for decades,
            made close to the kitchens it serves, and engineered to use less energy on every line.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary btn-lg" href="/products">Explore the equipment <ArrowRight /></Link>
            <Link className="btn btn-line-light btn-lg" href="/contact">Talk to our team</Link>
          </div>
        </div>
      </section>

      <div className="wrap content" style={{ paddingTop: "var(--s6)" }}>
        {/* Approach + big-number anchors */}
        <section className="pgsec">
          <span className="pg-eyebrow">Our approach</span>
          <h2>The most sustainable equipment is the one you don&apos;t replace.</h2>
          <p className="pg-lead">
            We&apos;ve built commercial kitchen equipment in New York for over 40 years — durable
            machines that stay in service for decades, produced locally with less waste, and
            engineered to cut the energy a kitchen burns every day.
          </p>
          <div className="pg-stats">
            {STATS.map((s) => (
              <div className="s" key={s.label}>
                <div className="n">{s.value}</div>
                <div className="l">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Focus-area pillars */}
        <section className="pgsec">
          <span className="pg-eyebrow">Focus areas</span>
          <h2>Where durability meets efficiency.</h2>
          <div className="valuegrid" style={{ marginTop: "var(--s5)", marginBottom: 0 }}>
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div className="valuecard" key={p.title}>
                  <Icon style={{ width: 22, height: 22, color: "var(--red)", marginBottom: 10 }} />
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

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
        <div className="ir-callout" style={{ marginTop: "var(--s4)", marginBottom: "var(--s4)" }}>
          <div>
            <span className="eyebrow">Spec sustainably</span>
            <h3>Building or refitting a kitchen?</h3>
            <p>Our New York team can help you spec durable, energy-efficient equipment for your line.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a className="btn" href={telHref(COMPANY.mainPhone)} style={{ background: "#fff", color: "var(--ink)" }}>{COMPANY.mainPhone}</a>
            <Link className="btn btn-line" href="/contact" style={{ borderColor: "rgba(255,255,255,.3)", color: "#fff" }}>Contact us</Link>
          </div>
        </div>
      </div>
    </>
  );
}
