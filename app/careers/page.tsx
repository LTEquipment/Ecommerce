import Link from "next/link";
import PageShell from "@/components/PageShell";
import { COMPANY } from "@/lib/company";

export const metadata = { title: "Careers — L&T" };

const ROLES = [
  { team: "Manufacturing", roles: "Welders, fabricators, assembly technicians", loc: "Staten Island & Brooklyn, NY" },
  { team: "Sales & accounts", roles: "B2B account managers, showroom sales", loc: "NYC showrooms" },
  { team: "Design & engineering", roles: "Product designers, R&D engineers", loc: "Staten Island, NY" },
  { team: "Field service", roles: "Installation & service technicians", loc: "NY metro" },
];

export default function CareersPage() {
  return (
    <PageShell
      title="Careers"
      eyebrow="Join us"
      intro="We're growing L&T for the next chapter — including the public markets. Build the equipment the best kitchens in the country cook on."
    >
      <h2>Why L&amp;T</h2>
      <p>
        For 40+ years we&apos;ve designed and built the Panda® line in New York. As we scale, we&apos;re
        hiring across manufacturing, sales, design and service — people who take pride in
        precision work and long customer relationships.
      </p>

      <h2>Open teams</h2>
      <ul>
        {ROLES.map((r) => (
          <li key={r.team}>
            <strong>{r.team}</strong> — {r.roles} · <span className="muted">{r.loc}</span>
          </li>
        ))}
      </ul>

      <h2>Apply</h2>
      <p>
        Send a résumé and a note about the team you&apos;re interested in to{" "}
        <a href={`mailto:${COMPANY.email}?subject=Careers`}>{COMPANY.email}</a>, or reach us through
        the <Link href="/contact">contact page</Link>. We review every application.
      </p>
    </PageShell>
  );
}
