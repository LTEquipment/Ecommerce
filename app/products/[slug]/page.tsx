import { notFound } from "next/navigation";
import { getProduct, getRelated, getCategory } from "@/lib/catalog";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductDetail from "@/components/ProductDetail";
import ProductReviews from "@/components/ProductReviews";
import ProductQA from "@/components/ProductQA";
import RelatedProducts from "@/components/RelatedProducts";
import RelatedGuides from "@/components/RelatedGuides";
import RecentlyViewed from "@/components/RecentlyViewed";
import JsonLd from "@/components/JsonLd";
import { productLd, breadcrumbLd } from "@/lib/seo";
import { getProductReviews, getReviewStats } from "@/lib/reviews";
import { getProductQuestions } from "@/lib/questions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Product — L&T" };
  const desc = (p.description || `${p.name} — ${p.brand ?? "Panda®"} commercial kitchen equipment, model ${p.sku}. Built in New York, shipped nationwide.`).slice(0, 300);
  const img = p.images?.[0];
  return {
    title: `${p.name} — L&T`,
    description: desc,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: {
      type: "website",
      title: `${p.name} — L&T Restaurant Equipment`,
      description: desc,
      url: `/products/${p.slug}`,
      ...(img ? { images: [{ url: img, alt: p.name }] } : {}),
    },
    ...(img ? { twitter: { card: "summary_large_image" as const, images: [img] } } : {}),
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const [cat, related, reviews, stats, questions] = await Promise.all([
    getCategory(p.cat),
    getRelated(p.slug, 4),
    getProductReviews(p.slug),
    getReviewStats(p.slug),
    getProductQuestions(p.slug),
  ]);
  return (
    <>
      <JsonLd
        data={[
          productLd(p, cat?.name, stats, reviews),
          breadcrumbLd([
            { name: "Home", url: "/" },
            ...(cat ? [{ name: cat.name, url: `/category/${cat.id}` }] : []),
            { name: p.name },
          ]),
        ]}
      />
      <div className="wrap">
        <Breadcrumbs
          items={[
            ...(cat ? [{ label: cat.name, href: `/category/${cat.id}` }] : []),
            { label: p.name },
          ]}
        />
      </div>
      <ProductDetail p={p} stats={stats} />
      <ProductReviews slug={p.slug} initialReviews={reviews} initialStats={stats} />
      <ProductQA slug={p.slug} initialQuestions={questions} />
      <RelatedProducts products={related} />
      <RelatedGuides query={`${cat?.name ?? ""} ${p.name}`} />
      <RecentlyViewed excludeSlug={p.slug} />
    </>
  );
}
