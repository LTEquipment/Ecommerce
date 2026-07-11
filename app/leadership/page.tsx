import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeader from "@/components/PageHeader";
import { BRAND } from "@/lib/brand";
import { MapPin } from "@/components/icons";

export const metadata = { title: "Leadership — L&T Restaurant Equipment" };

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export default function LeadershipPage() {
  return (
    <div className="wrap content">
      <Breadcrumbs items={[{ label: "About", href: "/about" }, { label: "Leadership" }]} />
      <PageHeader
        eyebrow="Our team"
        title="Leadership"
        intro="The people building L&T for its next chapter — decades of manufacturing, design and service experience across New York."
        meta={null}
      />

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

      <section className="section">
        <div className="prose">
          <h2>Governance</h2>
          <p>
            L&T is a founder-led company. Ahead of a public listing we&apos;re formalizing our board,
            audit and compensation practices — read more on{" "}
            <Link href="/investors#governance">corporate governance</Link>, or explore{" "}
            <Link href="/careers">careers</Link> to join the team.
          </p>
        </div>
      </section>
    </div>
  );
}
