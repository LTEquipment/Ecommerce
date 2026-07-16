import { notFound } from "next/navigation";
import { getCategories, getCategory, getProducts } from "@/lib/catalog";
import Breadcrumbs from "@/components/Breadcrumbs";
import Catalog from "@/components/Catalog";
import PageHeader, { StatMeta } from "@/components/PageHeader";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, itemListLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cat = await getCategory(id);
  if (!cat) return { title: "Category — L&T" };
  const desc = (cat.blurb || `${cat.name} from L&T Restaurant Equipment — Panda® commercial kitchen equipment, built in New York and shipped nationwide.`).slice(0, 300);
  return {
    title: `${cat.name} — L&T`,
    description: desc,
    alternates: { canonical: `/category/${cat.id}` },
    openGraph: { type: "website", title: `${cat.name} — L&T Restaurant Equipment`, description: desc, url: `/category/${cat.id}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cat = await getCategory(id);
  if (!cat) notFound();
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const inCat = products.filter((p) => p.cat === cat.id);
  const count = inCat.length;
  const inStock = inCat.filter((p) => p.stock === "in").length;
  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([{ name: "Home", url: "/" }, { name: "Departments", url: "/products" }, { name: cat.name }]),
          itemListLd(inCat, cat.name),
        ]}
      />
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
