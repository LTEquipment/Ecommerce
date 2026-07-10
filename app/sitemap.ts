import type { MetadataRoute } from "next";
import { CATEGORIES, PRODUCTS } from "@/lib/products";

const BASE = "https://www.ltfse.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "", "/products", "/about", "/locations", "/contact", "/investors",
    "/faq", "/shipping", "/returns", "/warranty", "/financing", "/careers",
    "/privacy", "/terms", "/login", "/register", "/cart",
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
