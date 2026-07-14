import type { MetadataRoute } from "next";
import { CATEGORIES, PRODUCTS } from "@/lib/products";
import { getSiteSettings } from "@/lib/settings";

const BASE = "https://www.ltfse.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { investorRelationsEnabled } = await getSiteSettings();
  const staticPaths = [
    "", "/products", "/about", "/leadership", "/press", "/sustainability",
    "/vendors", "/locations", "/contact",
    ...(investorRelationsEnabled ? ["/investors"] : []),
    "/faq", "/shipping", "/returns", "/warranty", "/financing", "/careers",
    "/privacy", "/terms", "/cookies", "/accessibility", "/login", "/cart", "/wishlist", "/compare",
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

  const productEntries: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${BASE}/products/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
