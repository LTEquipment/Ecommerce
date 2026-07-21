// Server-only: pulls the ERP catalog feed and reconciles it onto the storefront's
// own products table. Reads env vars without a NEXT_PUBLIC_ prefix.

import { createClient } from "@supabase/supabase-js";

/**
 * Syncs price and stock from the ERP onto products the storefront already sells.
 *
 * Updates existing products by default. Passing createMissing also lists feed
 * rows the storefront does not sell yet — needed to populate an empty catalog,
 * but off by default: the ERP holds every part, fitting and internal SKU the
 * business has ever touched, and it has no "sell this on the web" flag, so
 * publishing the whole feed is a decision rather than a default.
 *
 * Name, brand and description are left alone unless syncCopy is set: the
 * storefront's wording is customer-facing marketing, the ERP's is internal.
 */

export type CatalogSyncReport = {
  ok: boolean;
  reason?: string;
  fetched: number;
  matched: number;
  updated: number;
  unchanged: number;
  /** In the ERP feed but not sold on the storefront — expected, not an error. */
  notListed: number;
  /** Newly listed on the storefront from the feed (only when createMissing). */
  created: number;
  /** Feed rows skipped because they cannot be listed (no price, no model no.). */
  skipped: number;
  /** ERP categories no rule matched — these landed in accessories. */
  unmappedCategories: string[];
  /** Which storefront department each ERP category resolved to, with counts, so
   *  a dry run can be checked for sense and not just for volume. */
  categoryBreakdown: Record<string, number>;
  /** Sold on the storefront but absent from the feed — worth a look. */
  missingFromErp: string[];
  failures: { sku: string; error: string }[];
};

/**
 * A product as returned by the ERP's Partner API (GET /products).
 *
 * Note what is absent: no model_number is populated on any row, so `id`
 * (e.g. "EXT-MR9R8DUX-OBBCS") is the only stable key, and `stock` is 0 on the
 * whole catalog — meaning "not tracked", not "none left".
 */
type FeedItem = {
  id: string;
  name: string;
  category: string | null;
  series: string | null;
  brand?: string | null;
  description?: string | null;
  price: string | number | null;
  image_url: string | null;
  stock?: number | null;
};


/**
 * Maps the ERP's free-text category onto a storefront category_id (a foreign key
 * into `categories`) and an `art` key for the placeholder illustration.
 *
 * The ERP taxonomy is prose — "wok range", "wok station", "range", "roaster" —
 * so this matches on keywords, most specific first. Anything unrecognised lands
 * in accessories and is reported rather than guessed at, because a wrong
 * category silently buries a product in the wrong department of a live shop.
 */
const CATEGORY_RULES: { test: RegExp; category: string; art: string }[] = [
  { test: /wok|chinese range|stir.?fry/i,        category: "wok-range",             art: "wok" },
  { test: /steam|noodle/i,                        category: "steamer",               art: "rice" },
  { test: /roast|oven|bake|convection/i,          category: "roaster",               art: "oven" },
  { test: /fridge|refrig|freezer|chiller|cooler/i,category: "refrigeration",         art: "fridge" },
  { test: /hood|vent|exhaust|make.?up air/i,      category: "hood",                  art: "rack" },
  { test: /fryer|griddle|hot ?plate|burner|range/i, category: "optispace",           art: "range" },
  { test: /rice|induction|electric|automat/i,     category: "electric",              art: "rice" },
  { test: /mixer|blender|slicer|small ?appliance/i, category: "electric-kitchen-tool", art: "lamp" },
  { test: /pan|pot|wares|utensil|kitchenware/i,   category: "kitchenware",           art: "table" },
  { test: /shelf|shelving|rack|table|sink|prep/i, category: "accessories",           art: "rack" },
];

export function mapCategory(raw: string | null | undefined): { category: string; art: string; matched: boolean } {
  const text = (raw ?? "").trim();
  if (text) {
    for (const rule of CATEGORY_RULES) {
      if (rule.test.test(text)) return { category: rule.category, art: rule.art, matched: true };
    }
  }
  return { category: "accessories", art: "rack", matched: false };
}

/** URL id. The storefront's existing slugs are just the model number lowercased. */
export function slugFor(sku: string): string {
  return sku.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function erpCatalogConfigured(): boolean {
  return Boolean(process.env.ERP_API_URL && process.env.ERP_API_KEY);
}

/**
 * Pages through the Partner API. It caps at 50 rows per page and the catalog is
 * a few hundred products, so this walks pages rather than assuming one response
 * holds everything. Bounded so a misbehaving feed cannot loop forever.
 */
async function fetchAllProducts(): Promise<FeedItem[]> {
  const out: FeedItem[] = [];
  for (let page = 1; page <= 40; page++) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 20000);
    try {
      const res = await fetch(`${process.env.ERP_API_URL}/products?limit=50&page=${page}`, {
        signal: ctl.signal,
        headers: { "x-api-key": process.env.ERP_API_KEY!, accept: "application/json" },
      });
      if (!res.ok) throw new Error(`http ${res.status}`);
      const body = (await res.json()) as { products?: FeedItem[] };
      const batch = body.products ?? [];
      out.push(...batch);
      if (batch.length < 50) break;
    } finally {
      clearTimeout(timer);
    }
  }
  return out;
}

export async function syncCatalogFromErp(
  opts: { syncCopy?: boolean; dryRun?: boolean; createMissing?: boolean } = {}
): Promise<CatalogSyncReport> {
  const empty: CatalogSyncReport = {
    ok: false, fetched: 0, matched: 0, updated: 0, unchanged: 0,
    created: 0, skipped: 0, unmappedCategories: [], categoryBreakdown: {}, notListed: 0,
    missingFromErp: [], failures: [],
  };
  if (!erpCatalogConfigured()) return { ...empty, reason: "not-configured" };

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ...empty, reason: "storefront-db-not-configured" };

  // --- pull the feed -------------------------------------------------------
  let feed: FeedItem[];
  try {
    feed = await fetchAllProducts();
  } catch (e) {
    return { ...empty, reason: e instanceof Error ? e.message : "network" };
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const { data: listed, error: readErr } = await admin
    .from("products")
    .select("slug,sku,name,brand,description,price,stock");
  if (readErr) return { ...empty, reason: `storefront read: ${readErr.message}`, fetched: feed.length };

  const bySku = new Map((listed ?? []).map((p) => [String(p.sku).trim().toUpperCase(), p]));
  const seen = new Set<string>();

  const report: CatalogSyncReport = { ...empty, ok: true, fetched: feed.length };

  // Slugs come from names, and names repeat — seven products share the same
  // "custom made ... wok range" wording. Without a suffix they would overwrite
  // one another and seven products would land as one.
  const slugTally = new Map<string, number>();
  const uniqueSlug = (base: string) => {
    const n = (slugTally.get(base) ?? 0) + 1;
    slugTally.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };

  for (const item of feed) {
    const sku = (item.id ?? "").trim().toUpperCase();
    const name = (item.name ?? "").trim();
    const price = Number(item.price ?? 0);
    if (!sku) continue;

    const current = bySku.get(sku);
    if (!current) {
      report.notListed++;
      if (!opts.createMissing) continue;

      // A name that is only digits is a placeholder row, not a product; a
      // product with no price cannot be sold. Neither belongs on a public shop.
      const base = slugFor(name) || slugFor(sku);
      if (!name || /^\d+$/.test(name) || price <= 0 || !base) { report.skipped++; continue; }

      const { category, art, matched } = mapCategory(name || item.category);
      if (!matched && !report.unmappedCategories.includes(item.category ?? "")) {
        report.unmappedCategories.push(item.category ?? "(none)");
      }
      const key = `${item.category ?? "(none)"} -> ${category}`;
      report.categoryBreakdown[key] = (report.categoryBreakdown[key] ?? 0) + 1;

      if (opts.dryRun) { report.created++; continue; }

      const { error } = await admin.from("products").insert({
        slug: uniqueSlug(base), sku, name,
        brand: item.brand ?? null,
        description: item.description ?? "",
        category_id: category, art, price,
        images: item.image_url ? [item.image_url] : [],
        // The ERP reports stock 0 across the entire catalog, which means "not
        // tracked" rather than "none left" — marking every product Backorder
        // would be a false claim to customers.
        stock: "in",
      });
      if (error) report.failures.push({ sku, error: error.message });
      else report.created++;
      continue;
    }
    seen.add(sku);
    report.matched++;

    const patch: Record<string, unknown> = {};

    // Price: authoritative, and only when the ERP actually has one. A feed row
    // with price 0 usually means "not priced yet", not "free".
    if (price > 0 && Number(current.price) !== price) patch.price = price;

    if (opts.syncCopy) {
      if (item.name && item.name !== current.name) patch.name = item.name;
      if (item.brand && item.brand !== current.brand) patch.brand = item.brand;
      if (item.description && item.description !== current.description) patch.description = item.description;
    }

    if (Object.keys(patch).length === 0) { report.unchanged++; continue; }
    if (opts.dryRun) { report.updated++; continue; }

    const { error } = await admin.from("products").update(patch).eq("slug", current.slug);
    if (error) report.failures.push({ sku, error: error.message });
    else report.updated++;
  }

  // Listed on the shop but absent from the ERP feed — could be archived upstream,
  // or a SKU mismatch. Surfaced rather than silently ignored.
  report.missingFromErp = (listed ?? [])
    .map((p) => String(p.sku).trim().toUpperCase())
    .filter((s) => !seen.has(s))
    .slice(0, 50);

  return report;
}
