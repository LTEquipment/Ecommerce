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

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const term = (q ?? "").trim().slice(0, 80);
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([{ name: "Home", url: "/" }, { name: term ? "Search" : "All equipment" }]),
          itemListLd(products, "All equipment"),
        ]}
      />
      <div className="wrap">
        <Breadcrumbs items={term ? [{ label: "Search results" }] : [{ label: "All equipment" }]} />
        {/* On a search, the "Showing N" toolbar is the source of truth for the count,
            so the header stat (catalog-wide) is dropped for the default call line to
            avoid contradicting it. */}
        <PageHeader
          eyebrow={term ? "Search" : "The full line"}
          title={term ? `Results for “${term}”` : "All equipment"}
          intro={term
            ? "Matching by model number, name, brand, department and specs. Refine with the filters, or clear the search to browse everything."
            : "Every Panda® range, steamer, roaster, cooler and smallware — filter by department, brand, price and availability."}
          meta={term ? undefined : <StatMeta n={products.length} label="products" />}
        />
      </div>
      <Catalog categories={categories} products={products} title="" />
    </>
  );
}
