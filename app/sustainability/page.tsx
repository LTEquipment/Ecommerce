import Link from "next/link";
import { COMPANY, telHref } from "@/lib/company";
import { ArrowRight } from "@/components/icons";

export const metadata = { title: "Sustainability — L&T Restaurant Equipment" };

const FACTS = [
  { value: "40+", label: "Years building to last" },
  { value: "60,000", label: "Sq ft · one NY factory" },
  { value: "30+", label: "Years on the same line" },
  { value: "R-290", label: "Natural refrigerant" },
];

// What L&T provides to the businesses it serves.
const FOR_BUSINESS = [
  {
    title: "Bought once, not every few years",
    desc: "A range engineered to run for decades is a capital purchase, not a recurring one. Heavy-gauge steel and serviceable, repairable parts mean the payback keeps going long after the invoice — lowering total cost of ownership for the operators who run our equipment.",
  },
  {
    title: "Lower cost on every shift",
    desc: "Energy Star–qualified models, high-efficiency burners and induction, and R-290 refrigeration cut the fuel and power a kitchen burns each service. For a working restaurant, that shows up as a lighter utility bill, month after month.",
  },
  {
    title: "Less downtime, local support",
    desc: "When a unit needs attention, factory parts and a New York service team keep the line moving — no waiting weeks on an importer an ocean away. Uptime is revenue, and we build to protect it.",
  },
];

// What L&T provides to New York and the environment.
const FOR_SOCIETY = [
  {
    title: "Skilled jobs, kept in New York",
    desc: "Vertically integrated, made-in-America manufacturing keeps fabrication, welding and engineering work in our New York factory — supporting local, skilled trades and a shorter, more resilient supply chain than importing and reselling.",
  },
  {
    title: "Designed out of the landfill",
    desc: "Equipment built to be repaired rather than replaced — with modular parts and stainless steel that is fully recyclable at end of life — keeps material and hardware out of the waste stream for decades.",
  },
  {
    title: "A lighter footprint, every year",
    desc: "Efficient burners, induction options and natural-refrigerant (R-290) systems mean the kitchens that run our equipment draw less energy and carry lower global-warming potential — a benefit that compounds over a machine's long service life.",
  },
];

export default function SustainabilityPage() {
  return (
    <>
      {/* Full-bleed video hero — just the wordmark */}
      <section className="pg-hero">
        <video className="pg-hero-bg" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
          <source src="/videos/sustainability.mp4" type="video/mp4" />
        </video>
        <div className="wrap pg-hero-inner">
          <span className="eyebrow">Built to last</span>
          <h1>Sustainability</h1>
          <div className="hero-cta">
            <Link className="btn btn-primary btn-lg" href="/products">Explore the equipment <ArrowRight /></Link>
            <Link className="btn btn-line-light btn-lg" href="/contact">Talk to our team</Link>
          </div>
        </div>
      </section>

      <div className="wrap content" style={{ paddingTop: 0 }}>
        {/* Mission — dual value: business + society */}
        <section className="ss-intro">
          <h2>Sustainability that pays back — on the line, and beyond it.</h2>
          <p>
            Equipment that lasts longer, costs less to run, and is built and serviced locally does
            more than shrink a footprint. It lowers what a kitchen spends, keeps skilled work in New
            York, and keeps tons of steel out of the landfill. This is what that means for the
            businesses we serve — and for the community and environment around them.
          </p>
        </section>

        {/* Facts */}
        <div className="ss-data">
          {FACTS.map((f) => (
            <div className="d" key={f.label}>
              <div className="n">{f.value}</div>
              <div className="l">{f.label}</div>
            </div>
          ))}
        </div>

        {/* For the businesses we serve */}
        <span className="ss-lab">For the kitchens you run</span>
        <div>
          {FOR_BUSINESS.map((v) => (
            <div className="value-row" key={v.title}>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>

        {/* For society & the environment */}
        <span className="ss-lab">For New York &amp; the planet</span>
        <div>
          {FOR_SOCIETY.map((v) => (
            <div className="value-row" key={v.title}>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Reporting */}
        <section className="pgsec">
          <span className="pg-eyebrow">Reporting &amp; goals</span>
          <h2>Measured, not marketed.</h2>
          <p className="pg-body">
            As we prepare for our next chapter — including a public listing — we&apos;re formalizing
            our environmental and community reporting alongside our governance framework. We will
            publish measurable targets and progress here as they are set, rather than make claims we
            can&apos;t yet stand behind. For governance and investor detail, see{" "}
            <Link href="/investors#governance">corporate governance</Link>.
          </p>
        </section>

        {/* CTA */}
        <section className="cta-band">
          <h2>Building or refitting a kitchen?</h2>
          <p>Our New York team can help you spec durable, energy-efficient equipment that works harder for your business.</p>
          <div className="hero-cta" style={{ justifyContent: "center" }}>
            <a className="btn btn-primary btn-lg" href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a>
            <Link className="btn btn-line btn-lg" href="/contact">Contact us <ArrowRight /></Link>
          </div>
        </section>
      </div>
    </>
  );
}
