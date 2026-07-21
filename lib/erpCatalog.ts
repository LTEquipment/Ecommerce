// Server-only: pulls the ERP catalog feed and reconciles it onto the storefront's
// own products table. Reads env vars without a NEXT_PUBLIC_ prefix.

import { createClient } from "@supabase/supabase-js";

/**
 * Syncs price and stock from the ERP onto products the storefront already sells.
 *
 * Updates only — never inserts. The ERP holds every part, fitting and internal
 * SKU the business has ever touched; publishing those to a public shop because
 * they appeared in a feed would be a mistake that is hard to undo. Listing a new
 * product stays a deliberate act in the admin, and this keeps what is listed
 * honest about price and availability.
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
  /** Sold on the storefront but absent from the feed — worth a look. */
  missingFromErp: string[];
  failures: { sku: string; error: string }[];
};

type FeedItem = {
  sku: string | null;
  name: string;
  brand: string | null;
  description: string | null;
  price: number;
  image_url: string | null;
  lifecycle_status: string | null;
  stock_qty: number | null;
};

export function erpCatalogConfigured(): boolean {
  return Boolean(process.env.ERP_CATALOG_URL && process.env.ERP_INGEST_TOKEN);
}

export async function syncCatalogFromErp(
  opts: { syncCopy?: boolean; dryRun?: boolean } = {}
): Promise<CatalogSyncReport> {
  const empty: CatalogSyncReport = {
    ok: false, fetched: 0, matched: 0, updated: 0, unchanged: 0,
    notListed: 0, missingFromErp: [], failures: [],
  };
  if (!erpCatalogConfigured()) return { ...empty, reason: "not-configured" };

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ...empty, reason: "storefront-db-not-configured" };

  // --- pull the feed -------------------------------------------------------
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 20000);
  let feed: FeedItem[];
  try {
    const res = await fetch(process.env.ERP_CATALOG_URL!, {
      signal: ctl.signal,
      headers: { authorization: `Bearer ${process.env.ERP_INGEST_TOKEN!}` },
    });
    const body = (await res.json().catch(() => ({}))) as { items?: FeedItem[]; error?: string };
    if (!res.ok) return { ...empty, reason: body.error ?? `http ${res.status}` };
    feed = Array.isArray(body.items) ? body.items : [];
  } catch (e) {
    return { ...empty, reason: e instanceof Error ? e.message : "network" };
  } finally {
    clearTimeout(timer);
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const { data: listed, error: readErr } = await admin
    .from("products")
    .select("slug,sku,name,brand,description,price,stock");
  if (readErr) return { ...empty, reason: `storefront read: ${readErr.message}`, fetched: feed.length };

  const bySku = new Map((listed ?? []).map((p) => [String(p.sku).trim().toUpperCase(), p]));
  const seen = new Set<string>();

  const report: CatalogSyncReport = { ...empty, ok: true, fetched: feed.length };

  for (const item of feed) {
    const sku = (item.sku ?? "").trim().toUpperCase();
    if (!sku) continue;
    const current = bySku.get(sku);
    if (!current) { report.notListed++; continue; }
    seen.add(sku);
    report.matched++;

    const patch: Record<string, unknown> = {};

    // Price: authoritative, and only when the ERP actually has one. A feed row
    // with price 0 usually means "not priced yet", not "free".
    if (item.price > 0 && Number(current.price) !== item.price) patch.price = item.price;

    // Availability: null stock means the ERP isn't tracking it, which is not the
    // same as zero — leave the storefront's own value alone in that case.
    if (item.stock_qty !== null && item.stock_qty !== undefined) {
      const stock = item.stock_qty > 0 ? "in" : "back";
      if (current.stock !== stock) patch.stock = stock;
    }

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
