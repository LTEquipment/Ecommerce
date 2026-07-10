import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ArtKey, Category, Product } from "./types";
import { CATEGORIES as MOCK_CATEGORIES, PRODUCTS as MOCK_PRODUCTS } from "./products";

/**
 * DATA LAYER
 * ----------
 * Reads the catalog from Supabase when env vars are present; otherwise falls
 * back to the bundled mock catalog (lib/products.ts). Any query error also
 * falls back, so the storefront always renders. Public read via the anon key.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const catalogFromDb = Boolean(url && anon);

let sb: SupabaseClient | null = null;
function db(): SupabaseClient | null {
  if (!catalogFromDb) return null;
  if (!sb) sb = createClient(url!, anon!, { auth: { persistSession: false } });
  return sb;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToProduct(r: any): Product {
  return {
    slug: r.slug,
    sku: r.sku,
    name: r.name,
    cat: r.category_id,
    art: (r.art ?? "range") as ArtKey,
    price: Number(r.price),
    was: r.was_price != null ? Number(r.was_price) : undefined,
    images: r.images ?? [],
    specs: r.specs ?? {},
    description: r.description ?? undefined,
    brand: r.brand ?? undefined,
    rating: Number(r.rating ?? 4.7),
    n: r.reviews ?? 0,
    badge: (r.badge ?? "") as Product["badge"],
    stock: (r.stock ?? "in") as Product["stock"],
  };
}
function rowToCategory(r: any): Category {
  return { id: r.id, name: r.name, art: (r.art ?? "range") as ArtKey, blurb: r.blurb ?? "", count: r.count ?? undefined };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getCategories(): Promise<Category[]> {
  const c = db();
  if (!c) return MOCK_CATEGORIES;
  const { data, error } = await c.from("categories").select("*").order("sort");
  if (error || !data?.length) return MOCK_CATEGORIES;
  return data.map(rowToCategory);
}

export async function getProducts(): Promise<Product[]> {
  const c = db();
  if (!c) return MOCK_PRODUCTS;
  const { data, error } = await c.from("products").select("*").order("sort");
  if (error || !data?.length) return MOCK_PRODUCTS;
  return data.map(rowToProduct);
}

export async function getCategory(id: string): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.id === id);
}

export async function getProductsByCategory(id: string): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.cat === id);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const c = db();
  if (c) {
    const { data } = await c.from("products").select("*").eq("slug", slug).maybeSingle();
    if (data) return rowToProduct(data);
  }
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

/** Up to `n` other products from the same category, else any. */
export async function getRelated(slug: string, n = 4): Promise<Product[]> {
  const all = await getProducts();
  const self = all.find((p) => p.slug === slug);
  if (!self) return all.slice(0, n);
  const same = all.filter((p) => p.cat === self.cat && p.slug !== slug);
  const rest = all.filter((p) => p.cat !== self.cat && p.slug !== slug);
  return [...same, ...rest].slice(0, n);
}

/** Slugs for generateStaticParams — from mock so builds don't require the DB. */
export function allProductSlugs(): string[] {
  return MOCK_PRODUCTS.map((p) => p.slug);
}
