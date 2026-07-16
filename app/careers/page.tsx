import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import EditorialHero from "@/components/EditorialHero";
import { COMPANY } from "@/lib/company";
import { MapPin, ArrowRight } from "@/components/icons";

export const metadata = {
  title: "Careers — L&T Restaurant Equipment",
  description:
    "Careers at L&T Restaurant Equipment. We design, build and service the Panda® line in New York — hiring in manufacturing, sales, design and field service.",
  alternates: { canonical: "/careers" },
};

const WHY_POINTS = [
  {
    title: "Real craft",
    desc: "Hands-on work building equipment that runs the busiest kitchens in the country.",
  },
  {
    title: "Stability and growth",
    desc: "Four decades in business, and growing every year.",
  },
  {
    title: "Made in New York",
    desc: "Design, build and service under one roof — one team, one floor.",
  },
  {
    title: "Ownership",
    desc: "Your work ships with your name on it, to customers you'll know for years.",
  },
];

const ROLES = [
  {
    team: "Manufacturing",
    roles: "Welders, fabricators, assembly technicians",
    loc: "Staten Island & Brooklyn, NY",
    blurb: "Build the Panda® line on our New York floor — cutting, welding and assembling wok ranges, steamers and roasters to spec.",
  },
  {
    team: "Sales & accounts",
    roles: "B2B account managers, showroom sales",
    loc: "NYC showrooms",
    blurb: "Help restaurants, hospitality groups and dealers spec the right equipment and grow long-term trade accounts.",
  },
  {
    team: "Design & engineering",
    roles: "Product designers, R&D engineers",
    loc: "Staten Island, NY",
    blurb: "Design the next generation of high-output cooking equipment — burners, chambers, controls and automation.",
  },
  {
    team: "Field service",
    roles: "Installation & service technicians",
    loc: "NY metro",
    blurb: "Install, commission and service equipment in working kitchens across the metro area.",
  },
];

const applyHref = (team: string) => `/contact?role=${encodeURIComponent(team)}`;

export default function CareersPage() {
  return (
    <>
      <EditorialHero
        kicker="Join us"
        title="Careers"
        lede="We design, build and service the Panda® line in New York — and we're growing for our next chapter. Come build the equipment the best kitchens in the country cook on."
      >
        <Link className="btn btn-primary btn-lg" href="#teams">See open teams <ArrowRight /></Link>
        <a className="btn btn-line-light btn-lg" href={`mailto:${COMPANY.email}?subject=${encodeURIComponent("Careers")}`}>Email us</a>
      </EditorialHero>

      <div className="wrap content" style={{ paddingTop: "var(--s6)" }}>
        <Breadcrumbs items={[{ label: "Careers" }]} />

        {/* Why L&T */}
        <section id="why" className="pgsec" style={{ borderTop: 0, paddingTop: "var(--s2)" }}>
          <span className="pg-eyebrow">Why L&amp;T</span>
          <h2>Craft, stability and a name on the work.</h2>
          <p className="pg-body">
            For 40+ years we&apos;ve designed and built the Panda® line in New York — vertically
            integrated, made-in-America manufacturing that competitors import and resell. As we grow,
            we&apos;re hiring across manufacturing, sales, design and service: people who take pride
            in precision work, quality and long customer relationships.
          </p>
        </section>
        <div>
          {WHY_POINTS.map((v, i) => (
            <div className="value-row" key={v.title}>
              <div className="vr-head">
                <span className="vr-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{v.title}</h3>
              </div>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>

        {/* How we work */}
        <section id="work" className="pgsec">
          <span className="pg-eyebrow">How we work</span>
          <h2>Founder-led, not a middleman.</h2>
          <p className="pg-body">
            We&apos;re a founder-led manufacturer, not a middleman. Teams are small, decisions are
            quick, and the people who build and sell the equipment talk to the people who use it. We
            invest in training and promote from within as we grow. Compensation and benefits are
            discussed openly during the interview process.
          </p>
        </section>

        {/* Open teams */}
        <span className="ss-lab" id="teams">Open teams</span>
        <div>
          {ROLES.map((r, i) => (
            <div className="value-row" key={r.team}>
              <div className="vr-head">
                <span className="vr-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{r.team}</h3>
              </div>
              <div className="vr-meta">
                <p className="vr-blurb">{r.blurb}</p>
                <span className="vr-roles">{r.roles}</span>
                <span className="rloc"><MapPin /> {r.loc}</span>
                <Link className="btn btn-line" href={applyHref(r.team)}>Express interest <ArrowRight /></Link>
              </div>
            </div>
          ))}
        </div>

        {/* How to apply */}
        <section id="apply" className="pgsec">
          <span className="pg-eyebrow">How to apply</span>
          <h2>A simple, human process.</h2>
          <p className="pg-body">
            Send a résumé and a short note about the team you&apos;re interested in to{" "}
            <a href={`mailto:${COMPANY.email}?subject=${encodeURIComponent("Careers")}`}>{COMPANY.email}</a>,
            or reach us through the <Link href="/contact">contact page</Link>. Our process is simple:
            we review every application, follow up if there&apos;s a fit, and typically meet for a
            conversation and a look at the work before an offer.
          </p>
        </section>

        {/* Equal opportunity */}
        <section id="eeo" className="pgsec">
          <span className="pg-eyebrow">Equal opportunity</span>
          <h2>An equal opportunity employer.</h2>
          <p className="pg-body">
            {COMPANY.legalName} is an equal opportunity employer. We consider all qualified applicants
            without regard to race, color, religion, sex, sexual orientation, gender identity,
            national origin, age, disability, veteran status, or any other characteristic protected by
            law. If you need a reasonable accommodation during the application process, let us know at{" "}
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
          </p>
        </section>
      </div>
    </>
  );
}
