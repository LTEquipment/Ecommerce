import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeader from "@/components/PageHeader";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { COMPANY, telHref } from "@/lib/company";
import { ArrowRight, FileText, Truck, Package, Shield, MapPin, Card, Phone, Mail } from "@/components/icons";

export const metadata = {
  title: "Support — L&T Restaurant Equipment",
  description:
    "Get help with orders, shipping, returns, warranty and parts — track an order or reach the L&T New York team. Everything support in one place.",
  alternates: { canonical: "/support" },
};

const CARDS = [
  { href: "/track", Icon: Package, cat: "Orders", title: "Track an order", desc: "Check status and shipment tracking with your order number and email." },
  { href: "/shipping", Icon: Truck, cat: "Delivery", title: "Shipping & freight", desc: "How heavy equipment ships, freight rates, liftgate and inside delivery." },
  { href: "/returns", Icon: Package, cat: "Returns", title: "Returns", desc: "Our return policy for new, unused stock equipment and smallwares." },
  { href: "/warranty", Icon: Shield, cat: "Warranty", title: "Warranty & parts", desc: "Coverage, registering equipment, claims and replacement parts." },
  { href: "/faq", Icon: FileText, cat: "FAQ", title: "Frequently asked", desc: "Answers on ordering, payment, freight, lead times and trade accounts." },
  { href: "/guides", Icon: FileText, cat: "Guides", title: "Equipment guides", desc: "Buyer guides on speccing, sizing and certifying kitchen equipment." },
  { href: "/financing", Icon: Card, cat: "Financing", title: "Financing & trade", desc: "Trade accounts, contract pricing and Affirm monthly financing." },
  { href: "/locations", Icon: MapPin, cat: "Visit", title: "Showrooms & factory", desc: "Visit a NYC showroom or the Staten Island factory, or call the line." },
];

export default function SupportPage() {
  return (
    <div className="wrap content">
      <JsonLd data={[breadcrumbLd([{ name: "Home", url: "/" }, { name: "Support" }])]} />
      <Breadcrumbs items={[{ label: "Support" }]} />
      <PageHeader
        eyebrow="Help"
        title="How can we help?"
        intro="Track an order, find shipping and warranty answers, or reach our New York team — everything support in one place."
        meta={null}
      />

      <div className="sup-actions">
        <Link className="btn btn-primary btn-lg" href="/track">Track an order <ArrowRight /></Link>
        <Link className="btn btn-line btn-lg" href="/contact">Contact us</Link>
        <a className="btn btn-line btn-lg" href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a>
      </div>

      <div className="guide-grid">
        {CARDS.map((c) => (
          <Link className="guide-card sup-card" href={c.href} key={c.href}>
            <span className="sup-ic"><c.Icon /></span>
            <span className="guide-cat">{c.cat}</span>
            <h2>{c.title}</h2>
            <p>{c.desc}</p>
            <span className="guide-more">Open <ArrowRight /></span>
          </Link>
        ))}
      </div>

      <section className="sup-contact">
        <div className="sup-contact-copy">
          <span className="pg-eyebrow">Still need help?</span>
          <h2>Talk to our New York team.</h2>
          <p>Spec support, freight quotes, order questions and service — Monday to Friday.</p>
        </div>
        <div className="sup-contact-lines">
          <a href={telHref(COMPANY.mainPhone)}><Phone /> {COMPANY.mainPhone}</a>
          <a href={`mailto:${COMPANY.email}`}><Mail /> {COMPANY.email}</a>
        </div>
      </section>
    </div>
  );
}
