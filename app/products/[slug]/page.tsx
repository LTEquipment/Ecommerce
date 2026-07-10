import { notFound } from "next/navigation";
import { getProduct, getRelated } from "@/lib/catalog";
import { getCategory } from "@/lib/catalog";
import { PRODUCTS } from "@/lib/products";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductDetail from "@/components/ProductDetail";
import RelatedProducts from "@/components/RelatedProducts";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await getProduct(params.slug);
  return { title: p ? `${p.name} — L&T` : "Product — L&T" };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await getProduct(params.slug);
  if (!p) notFound();
  const [cat, related] = await Promise.all([getCategory(p.cat), getRelated(p.slug, 4)]);
  return (
    <>
      <div className="wrap">
        <Breadcrumbs
          items={[
            ...(cat ? [{ label: cat.name, href: `/category/${cat.id}` }] : []),
            { label: p.name },
          ]}
        />
      </div>
      <ProductDetail p={p} />
      <RelatedProducts products={related} />
    </>
  );
}
