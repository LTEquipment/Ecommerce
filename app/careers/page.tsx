import Link from "next/link";
import PageShell from "@/components/PageShell";
import { COMPANY } from "@/lib/company";
import { MapPin, ArrowRight } from "@/components/icons";

export const metadata = { title: "Careers — L&T Restaurant Equipment" };

const SECTIONS = [
  { id: "why", label: "Why L&T" },
  { id: "work", label: "How we work" },
  { id: "teams", label: "Open teams" },
  { id: "apply", label: "How to apply" },
  { id: "eeo", label: "Equal opportunity" },
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

const applyHref = (team: string) =>
  `mailto:${COMPANY.email}?subject=${encodeURIComponent("Application — " + team)}`;

export default function CareersPage() {
  return (
    <PageShell
      title="Careers"
      eyebrow="Join us"
      intro="We design, build and service the Panda® line in New York — and we're growing for our next chapter, including the public markets. Come build the equipment the best kitchens in the country cook on."
      sections={SECTIONS}
    >
      <h2 id="why">Why L&amp;T</h2>
      <p>
        For 40+ years we&apos;ve designed and built the Panda® line in New York — vertically
        integrated, made-in-America manufacturing that competitors import and resell. As we scale
        toward a public listing, we&apos;re hiring across manufacturing, sales, design and service:
        people who take pride in precision work, quality and long customer relationships.
      </p>
      <ul>
        <li><strong>Real craft.</strong> Hands-on work building equipment that runs the busiest kitchens in the country.</li>
        <li><strong>Stability and growth.</strong> Four decades in business, now scaling for the public markets.</li>
        <li><strong>Made in New York.</strong> Design, build and service under one roof — one team, one floor.</li>
        <li><strong>Ownership.</strong> Your work ships with your name on it, to customers you&apos;ll know for years.</li>
      </ul>

      <h2 id="work">How we work</h2>
      <p>
        We&apos;re a founder-led manufacturer, not a middleman. Teams are small, decisions are quick,
        and the people who build and sell the equipment talk to the people who use it. We invest in
        training and promote from within as we grow. Compensation and benefits are discussed openly
        during the interview process.
      </p>

      <h2 id="teams">Open teams</h2>
      <p>
        We hire year-round across these teams. Don&apos;t see an exact title? Reach out anyway — we
        grow roles around strong people.
      </p>
      <div className="rolegrid">
        {ROLES.map((r) => (
          <div className="rolecard" key={r.team}>
            <h3>{r.team}</h3>
            <p className="roles">{r.roles}</p>
            <p className="rblurb">{r.blurb}</p>
            <span className="rloc"><MapPin /> {r.loc}</span>
            <a className="rapply" href={applyHref(r.team)}>Express interest <ArrowRight /></a>
          </div>
        ))}
      </div>

      <h2 id="apply">How to apply</h2>
      <p>
        Send a résumé and a short note about the team you&apos;re interested in to{" "}
        <a href={`mailto:${COMPANY.email}?subject=${encodeURIComponent("Careers")}`}>{COMPANY.email}</a>,
        or reach us through the <Link href="/contact">contact page</Link>. Our process is simple: we
        review every application, follow up if there&apos;s a fit, and typically meet for a
        conversation and a look at the work before an offer.
      </p>

      <h2 id="eeo">Equal opportunity</h2>
      <p>
        {COMPANY.legalName} is an equal opportunity employer. We consider all qualified applicants
        without regard to race, color, religion, sex, sexual orientation, gender identity, national
        origin, age, disability, veteran status, or any other characteristic protected by law. If you
        need a reasonable accommodation during the application process, let us know at{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>
    </PageShell>
  );
}
