import { getCategories, getProducts } from "@/lib/catalog";
import Breadcrumbs from "@/components/Breadcrumbs";
import Catalog from "@/components/Catalog";

export const metadata = { title: "All Equipment — L&T" };

export default async function ProductsPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <>
      <div className="wrap">
        <Breadcrumbs items={[{ label: "All equipment" }]} />
        <div className="page-head">
          <span className="eyebrow">The full line</span>
          <h1>All equipment</h1>
          <p>Every Panda® range, steamer, roaster, cooler and smallware — filter by department, price and availability.</p>
        </div>
      </div>
      <Catalog categories={categories} products={products} title="" />
    </>
  );
}
