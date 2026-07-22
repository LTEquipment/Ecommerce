// Server-only: pulls the ERP catalog feed and reconciles it onto the storefront's
// own products table. Reads env vars without a NEXT_PUBLIC_ prefix.

import { createClient } from "@supabase/supabase-js";
import { renderableImages } from "./imageHosts";
import { PLACEHOLDER_PRICE } from "./catalogRules";

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
  /** SKUs withheld because nothing in the row can name the product — reported
   *  by SKU so the gap is fixable upstream instead of vanishing into a count. */
  unnamed: string[];
  /** SKUs withheld because the price is the ERP's placeholder, not a price. */
  unpriced: string[];
  /** ERP categories no rule matched — these landed in accessories. */
  unmappedCategories: string[];
  /** Which storefront department each ERP category resolved to, with counts, so
   *  a dry run can be checked for sense and not just for volume. */
  categoryBreakdown: Record<string, number>;
  /** Sold on the storefront but absent from the feed — worth a look. */
  missingFromErp: string[];
  /** Removed because the ERP no longer sells them (only with delistMissing). */
  delisted: string[];
  /** Set when delisting was asked for but refused — see DELIST_CEILING. */
  delistRefused?: string;
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
  // Spec fields. Most are unpopulated today; they are mapped anyway so they
  // appear on product pages the moment someone fills them in upstream.
  btu?: string | number | null;
  voltage?: string | null;
  certification?: string | null;
  country_of_origin?: string | null;
  weight?: string | number | null;
  width?: string | number | null;
  depth?: string | number | null;
  height?: string | number | null;
};

/**
 * Product specs from the ERP row.
 *
 * Zero is not a measurement. The ERP stores unmeasured weights and dimensions
 * as `"0.0"`, which is a populated-looking string — counting fields as present
 * because they are non-empty reported weight as complete on all 215 products
 * when not one has been weighed. A zero-pound wok range is not a fact and must
 * not be printed on a spec table as though it were.
 *
 * Dimensions carry no unit here deliberately. The ERP does not say whether it
 * means inches or millimetres, and a number labelled with the wrong unit is
 * worse on a spec sheet than a number with none — this is equipment people size
 * rooms and gas lines around.
 */
export function specsFrom(item: FeedItem): Record<string, string> {
  const out: Record<string, string> = {};
  const add = (label: string, raw: unknown) => {
    const v = String(raw ?? "").trim();
    if (!v) return;
    if (/^-?[\d.]+$/.test(v) && Number(v) === 0) return;
    out[label] = v;
  };
  add("Model", item.model_number);
  add("BTU", item.btu);
  add("Voltage", item.voltage);
  add("Certification", item.certification);
  add("Country of origin", item.country_of_origin);
  add("Weight", item.weight);
  add("Width", item.width);
  add("Depth", item.depth);
  add("Height", item.height);
  return out;
}


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
/**
 * The most of the catalog delisting may remove in one run, as a fraction.
 *
 * "Absent from the feed" is indistinguishable from "the feed was short". A
 * page that returns 200 with fewer rows than it should looks exactly like the
 * end of the catalog, and the consequence of believing it is deleting products
 * the business still sells. A real round of upstream deletions is a slice; a
 * broken fetch is a landslide. Above this, the sync refuses and reports rather
 * than acting on a number it cannot distinguish from a bug.
 */
export const DELIST_CEILING = 0.25;

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
  opts: { syncCopy?: boolean; dryRun?: boolean; createMissing?: boolean; delistMissing?: boolean } = {}
): Promise<CatalogSyncReport> {
  const empty: CatalogSyncReport = {
    ok: false, fetched: 0, matched: 0, updated: 0, unchanged: 0,
    created: 0, skipped: 0, unnamed: [], unpriced: [], unmappedCategories: [], categoryBreakdown: {}, notListed: 0,
    missingFromErp: [], delisted: [], failures: [],
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

  // `stock_tracked` arrives with supabase/admin-catalog.sql, which may not have
  // been run. Probed once rather than assumed: writing a column that does not
  // exist fails the whole insert, and the sync has to keep working either way.
  const BASE_COLS = "slug,sku,name,brand,description,price,stock,specs";
  let hasStockTracked = true;
  let { data: listed, error: readErr } = await admin
    .from("products")
    .select(`${BASE_COLS},stock_tracked`);
  if (readErr) {
    hasStockTracked = false;
    ({ data: listed, error: readErr } = await admin.from("products").select(BASE_COLS));
  }
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
    // "11", "23". 26 of them carry a model number and are listed under it. The
    // other 16 do not, so there is nothing to title them with — item_number is
    // itself a bare number (55557, 55558 …), so falling back to it just swaps
    // one meaningless digit string for another. Those are rejected below.
    const rawName = (item.name ?? "").trim();
    const name = /^\d+$/.test(rawName) ? (item.model_number || rawName).trim() : rawName;

    const current = bySku.get(sku);
    if (!current) {
      report.notListed++;
      if (!opts.createMissing) continue;

      // Only a missing price or an unusable key disqualifies a product now.
      const base = slugFor(sku);
      if (!name || price <= 0 || !base) { report.skipped++; continue; }

      // A name still made of bare digits means the row had no model number to
      // fall back to. All 16 such rows are also priced at $1.00 and carry no
      // product_type — the signature of an unfinished ERP record, not of a
      // product. A public shop must not list an item it cannot name at a price
      // nobody set, so these are rejected rather than published. They are only
      // withheld from the storefront; the ERP row is untouched, and they list
      // themselves the moment someone fills in a name and a price upstream.
      if (/^\d+$/.test(name)) { report.unnamed.push(sku); report.skipped++; continue; }

      // A product nobody has priced must not be purchasable. Withheld from the
      // storefront only — the ERP row is untouched, and it lists itself the
      // moment a real price exists there.
      if (price <= PLACEHOLDER_PRICE) { report.unpriced.push(sku); report.skipped++; continue; }

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
        // 21 ERP rows point at a competitor's CDN. Those are dropped here as
        // well as at read time: they are not ours to serve, they vanish the day
        // that site reorganises, and they are what took the storefront down.
        images: renderableImages(item.image_url ? [item.image_url] : []),
        specs: specsFrom(item),
        stock: availability(item),
        ...(hasStockTracked ? { stock_tracked: item.stock_tracked === true } : {}),
      });
      if (error) report.failures.push({ sku, error: error.message });
      else report.created++;
      continue;
    }
    seen.add(sku);
    report.matched++;

    const patch: Record<string, unknown> = {};

    // Price: authoritative, and only when the ERP actually has one. 0 means
    // "not priced yet" rather than "free", and the placeholder means the same —
    // so neither may overwrite a real price on a product already being sold.
    if (price > PLACEHOLDER_PRICE && Number(current.price) !== price) patch.price = price;
    else if (price <= PLACEHOLDER_PRICE && !report.unpriced.includes(sku)) report.unpriced.push(sku);

    const stock = availability(item);
    if (current.stock !== stock) patch.stock = stock;

    // Whether the ERP counts this product at all. Kept in step so the admin's
    // low-stock alert applies to the products someone is really counting rather
    // than to everything that happens to sit at zero.
    if (hasStockTracked) {
      const tracked = item.stock_tracked === true;
      if ((current as { stock_tracked?: boolean }).stock_tracked !== tracked) patch.stock_tracked = tracked;
    }

    // Specs are facts the ERP owns, not marketing wording, so they sync without
    // syncCopy. Merged over whatever is already there rather than replacing it:
    // a spec typed in the admin should survive a sync that has nothing to say
    // about that field. The ERP wins where both have a value.
    const erpSpecs = specsFrom(item);
    if (Object.keys(erpSpecs).length) {
      const existing = (current.specs ?? {}) as Record<string, string>;
      const merged = { ...existing, ...erpSpecs };
      if (JSON.stringify(merged) !== JSON.stringify(existing)) patch.specs = merged;
    }

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

  // Listed on the shop but absent from the ERP feed. The ERP is the master, so
  // this means the business has stopped selling them — they were deleted or
  // archived upstream. Left alone they stay on sale forever: 47 such products
  // were live at $19,778 with nothing upstream to fulfil them, and an order for
  // one would be rejected by the ERP as an unknown SKU after the customer paid.
  const bySkuListed = new Map(
    (listed ?? []).map((p) => [String(p.sku).trim().toUpperCase(), p])
  );
  const missing = [...bySkuListed.keys()].filter((s) => !seen.has(s));
  report.missingFromErp = missing.slice(0, 50);

  if (opts.delistMissing && missing.length) {
    const share = missing.length / Math.max(1, bySkuListed.size);
    if (share > DELIST_CEILING) {
      // Far more likely a short feed than a mass discontinuation.
      report.delistRefused =
        `would remove ${missing.length} of ${bySkuListed.size} products ` +
        `(${Math.round(share * 100)}%), above the ${Math.round(DELIST_CEILING * 100)}% ceiling — ` +
        `treating this as a truncated feed, not a real deletion`;
    } else if (opts.dryRun) {
      report.delisted = missing;
    } else {
      for (const sku of missing) {
        const row = bySkuListed.get(sku);
        if (!row) continue;
        const { error } = await admin.from("products").delete().eq("slug", row.slug);
        if (error) report.failures.push({ sku, error: error.message });
        else report.delisted.push(sku);
      }
    }
  }

  return report;
}
