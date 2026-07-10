import type { Category, Product } from "./types";
import { CATEGORIES, PRODUCTS } from "./products";

/**
 * DATA LAYER
 * ----------
 * These read the real L&T / Panda® catalog (lib/products.ts). When Supabase is
 * wired, replace ONLY the bodies below with queries — signatures stay the same,
 * so no page or component changes. See lib/supabase/README.md.
 */

export async function getCategories(): Promise<Category[]> {
  return CATEGORIES;
}

export async function getProducts(): Promise<Product[]> {
  return PRODUCTS;
}

export async function getCategory(id: string): Promise<Category | undefined> {
  return CATEGORIES.find((c) => c.id === id);
}

export async function getProductsByCategory(id: string): Promise<Product[]> {
  return PRODUCTS.filter((p) => p.cat === id);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** Up to `n` other products from the same category, else any. */
export async function getRelated(slug: string, n = 4): Promise<Product[]> {
  const self = PRODUCTS.find((p) => p.slug === slug);
  if (!self) return PRODUCTS.slice(0, n);
  const same = PRODUCTS.filter((p) => p.cat === self.cat && p.slug !== slug);
  const rest = PRODUCTS.filter((p) => p.cat !== self.cat && p.slug !== slug);
  return [...same, ...rest].slice(0, n);
}

/** Count per category id, for department tiles / facet counts. */
export function countByCategory(): Record<string, number> {
  const m: Record<string, number> = {};
  for (const p of PRODUCTS) m[p.cat] = (m[p.cat] || 0) + 1;
  return m;
}
