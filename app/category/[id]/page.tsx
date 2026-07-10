import { notFound } from "next/navigation";
import { getCategories, getCategory, getProducts } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/products";
import Breadcrumbs from "@/components/Breadcrumbs";
import Catalog from "@/components/Catalog";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const cat = await getCategory(params.id);
  return { title: cat ? `${cat.name} — L&T` : "Category — L&T" };
}

export default async function CategoryPage({ params }: { params: { id: string } }) {
  const cat = await getCategory(params.id);
  if (!cat) notFound();
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <>
      <div className="wrap">
        <Breadcrumbs items={[{ label: "Departments", href: "/products" }, { label: cat.name }]} />
        <div className="page-head">
          <span className="eyebrow">{cat.count}</span>
          <h1>{cat.name}</h1>
          <p>{cat.blurb}</p>
        </div>
      </div>
      <Catalog categories={categories} products={products} title="" lockedCat={cat.id} />
    </>
  );
}
