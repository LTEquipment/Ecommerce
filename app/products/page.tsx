import { getCategories, getProducts } from "@/lib/catalog";
import Breadcrumbs from "@/components/Breadcrumbs";
import Catalog from "@/components/Catalog";
import PageHeader, { StatMeta } from "@/components/PageHeader";

export const metadata = { title: "All Equipment — L&T" };
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <>
      <div className="wrap">
        <Breadcrumbs items={[{ label: "All equipment" }]} />
        <PageHeader
          eyebrow="The full line"
          title="All equipment"
          intro="Every Panda® range, steamer, roaster, cooler and smallware — filter by department, price and availability."
          image={products.find((p) => p.images[0])?.images[0]}
          meta={<StatMeta n={products.length} label="products" />}
        />
      </div>
      <Catalog categories={categories} products={products} title="" />
    </>
  );
}
