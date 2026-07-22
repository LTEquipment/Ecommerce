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
 * A product as returned by the ERP's Partner API (GET /products), which now
 * returns 27 fields rather than the original 13.
 *
 * `item_number` is the SKU: it is populated on every row, where `model_number`
 * has 18 gaps. `stock_tracked` disambiguates the stock figure — see below.
 */
type FeedItem = {
  id: string;
  item_number: string | null;
  model_number: string | null;
  name: string;
  product_type: string | null;
  series: string | null;
  category: string | null;
  brand?: string | null;
  description?: string | null;
  price: string | number | null;
  image_url: string | null;
  specsheet_url?: string | null;
  manual_url?: string | null;
  lifecycle_status?: string | null;
  /** null when stock_tracked is false — "nobody counts this", not "none left". */
  stock?: number | null;
  stock_tracked?: boolean | null;
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
/**
 * `product_type` → storefront department. An exact lookup, not keyword matching
 * on the product name: the ERP exposes a real taxonomy of ten values, so the
 * department is decided by data rather than by how a product happens to be
 * worded. The previous matcher misfiled anything phrased unusually and dumped
 * 19 products into Accessories because no keyword hit.
 *
 * Every value the ERP currently returns is covered. An unrecognised one is
 * reported rather than quietly bucketed, so a new product type shows up as
 * something to map instead of appearing in the wrong department.
 */
const TYPE_TO_DEPARTMENT: Record<string, { category: string; art: string }> = {
  "wok range":                        { category: "wok-range",   art: "wok" },
  "interchangeable steam range":      { category: "steamer",     art: "rice" },
  "hot roll plate finish polish":     { category: "optispace",   art: "range" },
  "multipurpose pork roaster oven":   { category: "roaster",     art: "oven" },
  "natural gas heavy duty pig roaster": { category: "roaster",   art: "oven" },
  "compartment sink":                 { category: "accessories", art: "table" },
  "compartment corner sink":          { category: "accessories", art: "table" },
  "compartment bar sink right":       { category: "accessories", art: "table" },
  "bar sink":                         { category: "accessories", art: "table" },
  "crh-p":                            { category: "wok-range",   art: "wok" },
};

export function mapCategory(
  productType: string | null | undefined,
  series?: string | null
): { category: string; art: string; matched: boolean } {
  const hit = TYPE_TO_DEPARTMENT[(productType ?? "").trim().toLowerCase()];
  if (hit) return { ...hit, matched: true };

  // 21 rows carry no product_type at all. Their series is "Standard" or
  // "Gas Equipment", neither of which identifies a department, so they are
  // filed under Accessories and counted — an ERP-side gap, not a mapping one.
  void series;
  return { category: "accessories", art: "rack", matched: false };
}

/**
 * Availability, per the API's stock contract:
 *
 *   stock_tracked false / stock null → nobody counts this. Sellable; say nothing.
 *   stock_tracked true,  stock 0     → genuinely none left. Backorder.
 *   stock > 0                        → that many on hand.
 *
 * Today every row returns stock_tracked false, so this behaves exactly as the
 * shop does now. The point is that it will be correct on the day counting
 * starts, without another change.
 */
export function availability(item: { stock?: number | null; stock_tracked?: boolean | null }): "in" | "back" {
  if (item.stock_tracked !== true) return "in";
  return (item.stock ?? 0) > 0 ? "in" : "back";
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

  // Slugs are built from the SKU, which is unique, rather than from names,
  // which repeat and which truncation used to collide. The tally is kept only
  // as a guard against an unexpected duplicate.
  const slugTally = new Map<string, number>();
  const uniqueSlug = (base: string) => {
    const n = (slugTally.get(base) ?? 0) + 1;
    slugTally.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };

  for (const item of feed) {
    // item_number is populated on all 262 rows; model_number has 18 gaps and id
    // is opaque. Never fall back to the name — names repeat and 42 are digits.
    const sku = (item.item_number || item.model_number || item.id || "").trim().toUpperCase();
    const price = Number(item.price ?? 0);
    if (!sku) continue;

    // 42 products lost their names in a spreadsheet import and are called "1",
    // "11", "23". They are real, priced and sellable, so they are listed under
    // their model number instead of being dropped.
    const rawName = (item.name ?? "").trim();
    const name = /^\d+$/.test(rawName)
      ? (item.model_number || item.item_number || rawName)
      : rawName;

    const current = bySku.get(sku);
    if (!current) {
      report.notListed++;
      if (!opts.createMissing) continue;

      // Only a missing price or an unusable key disqualifies a product now.
      const base = slugFor(sku);
      if (!name || price <= 0 || !base) { report.skipped++; continue; }

      const { category, art, matched } = mapCategory(item.product_type, item.series);
      if (!matched) {
        const label = item.product_type || "(no product_type)";
        if (!report.unmappedCategories.includes(label)) report.unmappedCategories.push(label);
      }
      const key = `${item.product_type ?? "(no product_type)"} -> ${category}`;
      report.categoryBreakdown[key] = (report.categoryBreakdown[key] ?? 0) + 1;

      if (opts.dryRun) { report.created++; continue; }

      const { error } = await admin.from("products").insert({
        slug: uniqueSlug(base), sku, name,
        brand: item.brand ?? null,
        description: item.description ?? "",
        category_id: category, art, price,
        images: item.image_url ? [item.image_url] : [],
        stock: availability(item),
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

    const stock = availability(item);
    if (current.stock !== stock) patch.stock = stock;

    if (opts.syncCopy) {
      if (name && name !== current.name) patch.name = name;
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
