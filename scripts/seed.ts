/**
 * Seed the Supabase catalog from lib/products.ts.
 * Usage: npm run seed   (reads .env.local for URL + SERVICE_ROLE key)
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { CATEGORIES, PRODUCTS } from "../lib/products";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

const cats = CATEGORIES.map((c, i) => ({
  id: c.id,
  name: c.name,
  art: c.art,
  blurb: c.blurb,
  count: c.count ?? null,
  sort: i,
}));

const prods = PRODUCTS.map((p, i) => ({
  slug: p.slug,
  sku: p.sku,
  name: p.name,
  category_id: p.cat,
  art: p.art,
  brand: p.brand ?? null,
  description: p.description ?? null,
  price: p.price,
  was_price: p.was ?? null,
  images: p.images,
  specs: p.specs,
  rating: p.rating,
  reviews: p.n,
  badge: p.badge ?? "",
  stock: p.stock,
  sort: i,
}));

async function run() {
  const { error: ce } = await sb.from("categories").upsert(cats, { onConflict: "id" });
  if (ce) throw ce;
  const { error: pe } = await sb.from("products").upsert(prods, { onConflict: "slug" });
  if (pe) throw pe;
  console.log(`✓ Seeded ${cats.length} categories and ${prods.length} products.`);
}

run().catch((e) => {
  console.error("Seed failed:", e.message ?? e);
  process.exit(1);
});
