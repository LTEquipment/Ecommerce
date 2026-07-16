import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { distinctBrands } from "@/lib/brands";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeader, { StatMeta } from "@/components/PageHeader";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop by brand — L&T",
  description:
    "Panda®, Dukers, Winco, Adcraft and more — browse commercial kitchen equipment by manufacturer at L&T Restaurant Equipment, shipped nationwide from New York.",
  alternates: { canonical: "/brands" },
};

export default async function BrandsPage() {
  const products = await getProducts();
  const brands = distinctBrands(products);
  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: "Home", url: "/" }, { name: "Brands" }])]} />
      <div className="wrap">
        <Breadcrumbs items={[{ label: "Brands" }]} />
        <PageHeader
          eyebrow="The lineup"
          title="Shop by brand"
          intro="From our own Panda® line to the trusted partners we stock, browse equipment by manufacturer."
          meta={<StatMeta n={brands.length} label="brands" />}
        />
        <div className="brand-grid">
          {brands.map((b) => (
            <Link key={b.slug} href={`/brands/${b.slug}`} className="brand-card">
              <span className="brand-card-name">{b.name}</span>
              <span className="brand-card-meta">
                {b.count} product{b.count === 1 ? "" : "s"} · {b.inStock} in stock
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
