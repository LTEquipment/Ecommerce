import type { MetadataRoute } from "next";
import { getProducts, getCategories } from "@/lib/catalog";
import { GUIDES } from "@/lib/guides";
import { distinctBrands } from "@/lib/brands";
import { getSiteSettings } from "@/lib/settings";

const BASE = "https://www.ltfse.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Derive product/category/brand URLs from the LIVE catalog so the sitemap
  // matches what the pages actually render (getProducts falls back to code).
  const [{ investorRelationsEnabled }, PRODUCTS, CATEGORIES] = await Promise.all([
    getSiteSettings(),
    getProducts(),
    getCategories(),
  ]);
  const staticPaths = [
    "", "/products", "/brands", "/about", "/leadership", "/press", "/sustainability",
    "/vendors", "/locations", "/contact", "/guides",
    ...(investorRelationsEnabled ? ["/investors"] : []),
    "/faq", "/shipping", "/returns", "/warranty", "/financing", "/careers",
    "/privacy", "/terms", "/cookies", "/accessibility",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${BASE}/category/${c.id}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const brandEntries: MetadataRoute.Sitemap = distinctBrands(PRODUCTS).map((b) => ({
    url: `${BASE}/brands/${b.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${BASE}/products/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
    images: (p.images ?? []).map((im) => `${BASE}${im}`),
  }));

  const guideEntries: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${BASE}/guides/${g.slug}`,
    lastModified: g.updated,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...brandEntries, ...productEntries, ...guideEntries];
}
