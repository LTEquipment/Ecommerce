import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { COMPANY, telHref } from "@/lib/company";

export const metadata = { title: "FAQ — L&T" };

const FAQS: { q: string; a: string }[] = [
  { q: "Do you build custom wok ranges?", a: "Yes. Custom-built ranges are our specialty — chamber size, burner configuration, backguards and finishes are made to order in our New York factory. Request a quote and our design team will spec it with you." },
  { q: "What are your freight rates and lead times?", a: "Free freight on orders over $999, otherwise a flat $89. In-stock equipment ships in 24–48 hours; backorders in 2–3 weeks. See the shipping page for details." },
  { q: "How do I open a trade account?", a: "Register for a trade account to get contract pricing, order history and 0% APR financing for approved accounts. It takes a couple of minutes." },
  { q: "Is your equipment certified?", a: "Yes — Panda® equipment is NSF, CSA and ETL listed. Full certifications and specs appear on every product page." },
  { q: "What payment methods do you accept?", a: "Major credit cards at checkout, plus terms and financing for approved trade accounts. For large or multi-site orders we'll arrange contract billing." },
  { q: "What's your warranty?", a: "Panda®-built equipment carries a one-year parts-and-labor warranty, with parts and service from our factory. See the warranty page." },
  { q: "Do you deliver and install?", a: "We ship palletized nationwide and offer liftgate and threshold delivery on request. Installation and field service are available in the NY metro area." },
];

export default function FaqPage() {
  return (
    <div className="wrap content">
      <Breadcrumbs items={[{ label: "FAQ" }]} />
      <div className="lede-head">
        <span className="eyebrow">Help</span>
        <h1>Frequently asked questions</h1>
        <p>Answers on ordering, freight, custom builds, trade accounts and support.</p>
      </div>

      <div className="faq">
        {FAQS.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>

      <p style={{ marginTop: "var(--s5)", color: "var(--muted)", fontSize: 14 }}>
        Still have a question? Call <a href={telHref(COMPANY.mainPhone)} style={{ color: "var(--red)", fontWeight: 600 }}>{COMPANY.mainPhone}</a> or{" "}
        <Link href="/contact" style={{ color: "var(--red)", fontWeight: 600 }}>contact us</Link>.
      </p>
    </div>
  );
}
