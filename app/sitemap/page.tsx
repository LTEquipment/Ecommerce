import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeader from "@/components/PageHeader";
import { getProducts, getCategories } from "@/lib/catalog";
import { distinctBrands } from "@/lib/brands";
import { getSiteSettings } from "@/lib/settings";
import { GUIDES } from "@/lib/guides";

export const metadata = {
  title: "Site map — L&T",
  description:
    "Every section of ltfse.com in one place — equipment departments, brands, ordering and support pages, company information, policies and equipment guides.",
  alternates: { canonical: "/sitemap" },
};

type Item = { href: string; label: string };
type Group = { title: string; items: Item[] };

export default async function SiteMapPage() {
  const [{ investorRelationsEnabled }, products, categories] = await Promise.all([
    getSiteSettings(),
    getProducts(),
    getCategories(),
  ]);

  const departments: Item[] = categories.map((c) => ({ href: `/category/${c.id}`, label: c.name }));
  const brands: Item[] = distinctBrands(products).map((b) => ({ href: `/brands/${b.slug}`, label: b.name }));

  const groups: Group[] = [
    {
      title: "Shop",
      items: [
        { href: "/products", label: "All products" },
        { href: "/brands", label: "Shop by brand" },
        { href: "/login?mode=register&trade=1", label: "Open a trade account" },
        { href: "/financing", label: "Financing & pricing" },
      ],
    },
    {
      title: "Ordering & support",
      items: [
        { href: "/track", label: "Track an order" },
        { href: "/shipping", label: "Shipping & freight" },
        { href: "/returns", label: "Returns & refunds" },
        { href: "/warranty", label: "Warranty & parts" },
        { href: "/faq", label: "FAQ" },
        { href: "/guides", label: "Equipment guides" },
        { href: "/contact", label: "Contact & spec support" },
      ],
    },
    {
      title: "Company",
      items: [
        { href: "/about", label: "About us" },
        { href: "/leadership", label: "Leadership" },
        { href: "/press", label: "Press" },
        { href: "/sustainability", label: "Sustainability" },
        { href: "/careers", label: "Careers" },
        { href: "/locations", label: "Showrooms" },
        { href: "/vendors", label: "Become a vendor" },
        ...(investorRelationsEnabled ? [{ href: "/investors", label: "Investor relations" }] : []),
      ],
    },
    {
      title: "Policies",
      items: [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Use" },
        { href: "/cookies", label: "Cookie Policy" },
        { href: "/accessibility", label: "Accessibility" },
        { href: "/supply-chain", label: "Supply Chain Transparency" },
      ],
    },
  ];

  return (
    <main className="wrap smap">
      <Breadcrumbs items={[{ label: "Site map" }]} />
      <PageHeader
        eyebrow="Directory"
        title="Site map"
        intro="Every section of the site in one place. Browse equipment by department or brand, find ordering and support pages, or jump straight to a guide."
        meta={null}
      />

      <div className="smap-grid">
        <section className="smap-col smap-wide">
          <h2>Departments</h2>
          <ul>
            {departments.map((it) => (
              <li key={it.href}>
                <Link href={it.href}>{it.label}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="smap-col smap-wide">
          <h2>Brands</h2>
          <ul>
            {brands.map((it) => (
              <li key={it.href}>
                <Link href={it.href}>{it.label}</Link>
              </li>
            ))}
          </ul>
        </section>

        {groups.map((g) => (
          <section className="smap-col" key={g.title}>
            <h2>{g.title}</h2>
            <ul>
              {g.items.map((it) => (
                <li key={it.href}>
                  <Link href={it.href}>{it.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="smap-col smap-wide">
          <h2>Equipment guides</h2>
          <ul>
            {GUIDES.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`}>{g.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="smap-foot">
        Looking for the machine-readable version? See the{" "}
        <a href="/sitemap.xml">XML sitemap</a>.
      </p>
    </main>
  );
}
