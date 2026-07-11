import { notFound } from "next/navigation";
import { getCategories, getCategory, getProducts } from "@/lib/catalog";
import Breadcrumbs from "@/components/Breadcrumbs";
import Catalog from "@/components/Catalog";
import PageHeader, { StatMeta } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const cat = await getCategory(params.id);
  return { title: cat ? `${cat.name} — L&T` : "Category — L&T" };
}

export default async function CategoryPage({ params }: { params: { id: string } }) {
  const cat = await getCategory(params.id);
  if (!cat) notFound();
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const inCat = products.filter((p) => p.cat === cat.id);
  const count = inCat.length;
  const inStock = inCat.filter((p) => p.stock === "in").length;
  return (
    <>
      <div className="wrap">
        <Breadcrumbs items={[{ label: "Departments", href: "/products" }, { label: cat.name }]} />
        <PageHeader
          eyebrow={cat.count}
          title={cat.name}
          intro={cat.blurb}
          meta={<StatMeta n={count} label="products" sub={`${inStock} in stock`} />}
        />
      </div>
      <Catalog categories={categories} products={products} title="" lockedCat={cat.id} />
    </>
  );
}
