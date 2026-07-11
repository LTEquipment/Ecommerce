import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeader from "@/components/PageHeader";
import HelpAside from "@/components/HelpAside";

export const metadata = { title: "FAQ — L&T" };

const GROUPS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Ordering & freight",
    items: [
      { q: "What are your freight rates and lead times?", a: "Free freight on orders over $999, otherwise a flat $89. In-stock equipment ships in 24–48 hours; backorders in 2–3 weeks. See the shipping page for details." },
      { q: "What payment methods do you accept?", a: "Major credit cards at checkout, plus terms and financing for approved trade accounts. For large or multi-site orders we'll arrange contract billing." },
      { q: "Do you deliver and install?", a: "We ship palletized nationwide and offer liftgate and threshold delivery on request. Installation and field service are available in the NY metro area." },
    ],
  },
  {
    title: "Equipment & custom builds",
    items: [
      { q: "Do you build custom wok ranges?", a: "Yes. Custom-built ranges are our specialty — chamber size, burner configuration, backguards and finishes are made to order in our New York factory. Request a quote and our design team will spec it with you." },
      { q: "Is your equipment certified?", a: "Yes — Panda® equipment is NSF, CSA and ETL listed. Full certifications and specs appear on every product page." },
    ],
  },
  {
    title: "Accounts & support",
    items: [
      { q: "How do I open a trade account?", a: "Register for a trade account to get contract pricing, order history and 0% APR financing for approved accounts. It takes a couple of minutes." },
      { q: "What's your warranty?", a: "Panda®-built equipment carries a one-year parts-and-labor warranty, with parts and service from our factory. See the warranty page." },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="wrap content">
      <Breadcrumbs items={[{ label: "FAQ" }]} />
      <PageHeader
        eyebrow="Help"
        title="Frequently asked questions"
        intro="Answers on ordering, freight, custom builds, trade accounts and support."
        meta={null}
      />

      <div className="doc">
        <article className="prose faq">
          {GROUPS.map((g) => (
            <section className="faq-group" key={g.title}>
              <h2>{g.title}</h2>
              {g.items.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </section>
          ))}
        </article>
        <aside className="doc-aside">
          <HelpAside />
        </aside>
      </div>
    </div>
  );
}
