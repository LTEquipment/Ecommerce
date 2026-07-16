import { getCategories, getProducts } from "@/lib/catalog";
import Breadcrumbs from "@/components/Breadcrumbs";
import Catalog from "@/components/Catalog";
import PageHeader, { StatMeta } from "@/components/PageHeader";
import JsonLd from "@/components/JsonLd";
import { itemListLd, breadcrumbLd } from "@/lib/seo";

export const metadata = {
  title: "All Equipment — L&T",
  description:
    "Shop the full L&T catalog — Panda® wok ranges, steamers, roasters, refrigeration and smallwares. Commercial kitchen equipment built in New York, shipped nationwide.",
  alternates: { canonical: "/products" },
};
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([{ name: "Home", url: "/" }, { name: "All equipment" }]),
          itemListLd(products, "All equipment"),
        ]}
      />
      <div className="wrap">
        <Breadcrumbs items={[{ label: "All equipment" }]} />
        <PageHeader
          eyebrow="The full line"
          title="All equipment"
          intro="Every Panda® range, steamer, roaster, cooler and smallware — filter by department, price and availability."
          meta={<StatMeta n={products.length} label="products" />}
        />
      </div>
      <Catalog categories={categories} products={products} title="" />
    </>
  );
}
