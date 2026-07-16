import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeader from "@/components/PageHeader";
import HelpAside from "@/components/HelpAside";
import JsonLd from "@/components/JsonLd";
import { faqLd } from "@/lib/seo";

export const metadata = {
  title: "FAQ — L&T",
  description: "Answers on ordering, freight, returns, custom wok ranges, quotes, trade accounts, warranty and support from L&T Restaurant Equipment.",
  alternates: { canonical: "/faq" },
};

type FaqItem = { q: string; a: string; link?: { href: string; label: string } };

const GROUPS: { title: string; items: FaqItem[] }[] = [
  {
    title: "Ordering & freight",
    items: [
      { q: "What are your freight rates and lead times?", a: "Free freight on orders over $999, otherwise a flat $89. In-stock equipment ships in 24–48 hours; backorders in 2–3 weeks.", link: { href: "/shipping", label: "Shipping & freight" } },
      { q: "What payment methods do you accept?", a: "Major credit cards at checkout, plus terms and 0% APR financing for approved trade accounts. For large or multi-site orders we'll arrange contract billing.", link: { href: "/financing", label: "Financing & pricing" } },
      { q: "Can I get a formal quote before ordering?", a: "Yes. Add items to your cart and choose Request a quote, and our New York team will email formal pricing with freight and lead times — no obligation.", link: { href: "/contact", label: "Contact us" } },
      { q: "How do I track my order?", a: "Once your order ships we email tracking, and you can follow it any time from the Orders tab in your account.", link: { href: "/account", label: "Your account" } },
      { q: "Do you deliver and install?", a: "We ship palletized nationwide and offer liftgate and threshold delivery on request. Installation and field service are available in the NY metro area." },
    ],
  },
  {
    title: "Equipment & custom builds",
    items: [
      { q: "Do you build custom wok ranges?", a: "Yes — custom-built ranges are our specialty. Chamber size, burner configuration, backguards and finishes are made to order in our New York factory. Request a quote and our design team will spec it with you.", link: { href: "/contact", label: "Request a custom build" } },
      { q: "Is your equipment certified?", a: "Panda® equipment is NSF, CSA and ETL listed. Full certifications and specs appear on every product page." },
      { q: "Can I get spec sheets, manuals or CAD?", a: "Every product page has a printable spec sheet plus any available documents. Need a submittal or CAD we don't list? Ask our spec team and we'll send it." },
      { q: "How do I choose the right equipment?", a: "Our equipment guides walk through sizing wok ranges, steamers, ventilation and more, station by station, the way a professional buyer thinks about it.", link: { href: "/guides", label: "Equipment guides" } },
    ],
  },
  {
    title: "Returns & warranty",
    items: [
      { q: "What is your return policy?", a: "30 days on new, unused stock items in original packaging. A 15% restocking fee applies, the customer pays return freight, and custom-built equipment is final sale.", link: { href: "/returns", label: "Returns & refunds" } },
      { q: "What warranty comes with my equipment?", a: "Panda®-built equipment carries a one-year parts-and-labor warranty, with parts and service direct from our factory.", link: { href: "/warranty", label: "Warranty & parts" } },
      { q: "How do I file a warranty claim?", a: "Sign in and open the Warranty & service tab in your account to file a claim — we review claims within a business day." , link: { href: "/account?tab=service", label: "File a claim" } },
    ],
  },
  {
    title: "Accounts & support",
    items: [
      { q: "How do I open a trade account?", a: "Register for a trade account to unlock contract pricing, saved addresses, order history and 0% APR financing for approved accounts. It takes a couple of minutes.", link: { href: "/login?mode=register&trade=1", label: "Open a trade account" } },
      { q: "Can I reorder past purchases?", a: "Yes — every past order in your account has a Reorder button that re-adds each still-available item to your cart in one click.", link: { href: "/account?tab=orders", label: "Your orders" } },
      { q: "Can I save shipping addresses for faster checkout?", a: "Yes. Add addresses in your account and pick one at checkout to auto-fill the shipping form.", link: { href: "/account", label: "Manage addresses" } },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="wrap content">
      <JsonLd data={faqLd(GROUPS.flatMap((g) => g.items))} />
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
                  <p>
                    {f.a}
                    {f.link && <> <Link href={f.link.href}>{f.link.label} →</Link></>}
                  </p>
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
