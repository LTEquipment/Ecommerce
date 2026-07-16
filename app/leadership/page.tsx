import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import EditorialHero from "@/components/EditorialHero";
import { BRAND } from "@/lib/brand";
import { MapPin, ArrowRight } from "@/components/icons";

export const metadata = {
  title: "Leadership — L&T Restaurant Equipment",
  description:
    "Meet the leadership team behind L&T Restaurant Equipment — decades of manufacturing, design and service experience building the Panda® brand in New York.",
  alternates: { canonical: "/leadership" },
};

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export default function LeadershipPage() {
  return (
    <>
      <EditorialHero
        kicker="Our team"
        title="Leadership"
        lede="The people building L&T for its next chapter — decades of manufacturing, design and service experience across New York."
      >
        <Link className="btn btn-line-light btn-lg" href="/careers">
          Join the team <ArrowRight />
        </Link>
      </EditorialHero>

      <div className="wrap content" style={{ paddingTop: "var(--s6)" }}>
        <Breadcrumbs items={[{ label: "About", href: "/about" }, { label: "Leadership" }]} />

        <section className="ir-sec" style={{ borderTop: 0, paddingTop: "var(--s2)" }}>
          <span className="ss-lab">The team</span>
          <div className="team-grid">
            {BRAND.team.map((t) => (
              <div className="team-card" key={t.name}>
                <span className="team-ava">{initials(t.name)}</span>
                <div className="team-name">{t.name}</div>
                <div className="team-role">{t.role}</div>
                <div className="team-region"><MapPin /> {t.region}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="pgsec">
          <span className="pg-eyebrow">Governance</span>
          <h2>A founder-led company.</h2>
          <p className="pg-body">
            L&amp;T is a founder-led company. As we grow, we&apos;re formalizing our board, audit and
            compensation practices. Explore{" "}
            <Link href="/careers">careers</Link> to join the team.
          </p>
        </section>
      </div>
    </>
  );
}
