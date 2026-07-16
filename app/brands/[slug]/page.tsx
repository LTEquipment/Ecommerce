import { notFound } from "next/navigation";
import { getCategories, getProducts } from "@/lib/catalog";
import { distinctBrands, brandSlug } from "@/lib/brands";
import Breadcrumbs from "@/components/Breadcrumbs";
import Catalog from "@/components/Catalog";
import PageHeader, { StatMeta } from "@/components/PageHeader";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, itemListLd, brandLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await getProducts();
  const brand = distinctBrands(products).find((b) => b.slug === slug);
  if (!brand) return { title: "Brand — L&T" };
  const clean = brand.name.replace(/[®™]/g, "").trim();
  const desc = `${clean} commercial kitchen equipment at L&T — ${brand.count} model${brand.count === 1 ? "" : "s"}, built and serviced in New York and shipped nationwide. Compare specs, pricing and lead times.`.slice(0, 300);
  return {
    title: `${clean} — L&T`,
    description: desc,
    alternates: { canonical: `/brands/${slug}` },
    openGraph: { type: "website", title: `${clean} — L&T Restaurant Equipment`, description: desc, url: `/brands/${slug}` },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const brand = distinctBrands(products).find((b) => b.slug === slug);
  if (!brand) notFound();
  const inBrand = products.filter((p) => p.brand && brandSlug(p.brand) === slug);
  const clean = brand.name.replace(/[®™]/g, "").trim();
  return (
    <>
      <JsonLd
        data={[
          brandLd(brand.name, slug),
          breadcrumbLd([{ name: "Home", url: "/" }, { name: "Brands", url: "/brands" }, { name: clean }]),
          itemListLd(inBrand, clean),
        ]}
      />
      <div className="wrap">
        <Breadcrumbs items={[{ label: "Brands", href: "/brands" }, { label: clean }]} />
        <PageHeader
          eyebrow="Shop by brand"
          title={clean}
          intro={`Every ${clean} model L&T carries — full specs, pricing and freight, ready for a working line.`}
          meta={<StatMeta n={brand.count} label="products" sub={`${brand.inStock} in stock`} />}
        />
      </div>
      <Catalog categories={categories} products={products} title="" lockedBrand={slug} />
    </>
  );
}
