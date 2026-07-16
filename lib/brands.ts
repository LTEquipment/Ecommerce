import type { Product } from "./types";

/** "Panda®" → "panda", "Hamilton Beach" → "hamilton-beach". Pure + client-safe. */
export function brandSlug(brand: string): string {
  return brand
    .replace(/[®™]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type BrandInfo = { name: string; slug: string; count: number; inStock: number };

/** Distinct brands present in a product list, with counts, most-stocked first. */
export function distinctBrands(products: Pick<Product, "brand" | "stock">[]): BrandInfo[] {
  const map = new Map<string, BrandInfo>();
  for (const p of products) {
    if (!p.brand) continue;
    const slug = brandSlug(p.brand);
    const cur = map.get(slug) ?? { name: p.brand, slug, count: 0, inStock: 0 };
    cur.count++;
    if (p.stock === "in") cur.inStock++;
    map.set(slug, cur);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
