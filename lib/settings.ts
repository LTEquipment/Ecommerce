import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Cache tag — the admin settings API revalidates this after a write. */
export const SETTINGS_TAG = "site-settings";

export type SiteSettings = {
  /** When false, the Investor Relations page (404s) and its nav links are hidden. */
  investorRelationsEnabled: boolean;
  /** Free freight at/above this order subtotal. */
  freightThreshold: number;
  /** Flat freight charged below the threshold. */
  freightFee: number;
  /** Sales tax rate as a decimal (0.08875 = 8.875%). */
  taxRate: number;
  /** Contract discount for APPROVED dealers, as a percent off list (0 = none). */
  dealerDiscountPct: number;
};

/**
 * Safe defaults, used when Supabase is unavailable or a key is unset. The freight
 * and tax defaults MUST match the storefront's historical hardcoded values so
 * behaviour is unchanged until an admin explicitly overrides them. Investor
 * Relations is OFF by default (pre-IPO — never publishes investor content early).
 */
const DEFAULTS: SiteSettings = {
  investorRelationsEnabled: false,
  freightThreshold: 999,
  freightFee: 89,
  taxRate: 0.08875,
  dealerDiscountPct: 0,
};

async function readSettings(): Promise<SiteSettings> {
  if (!url || !anon) return DEFAULTS;
  try {
    // Plain anon client (no cookies) so this read is cacheable and never forces
    // dynamic rendering. site_settings is world-readable (RLS: public select).
    const sb = createClient(url, anon, { auth: { persistSession: false } });
    const { data, error } = await sb.from("site_settings").select("key,value");
    if (error || !data) return DEFAULTS;
    const map = new Map(data.map((r) => [r.key as string, r.value]));
    const num = (key: string, def: number) => {
      const v = map.get(key);
      return typeof v === "number" && Number.isFinite(v) ? v : def;
    };
    return {
      investorRelationsEnabled: map.get("investor_relations_enabled") === true,
      freightThreshold: num("freight_threshold", DEFAULTS.freightThreshold),
      freightFee: num("freight_fee", DEFAULTS.freightFee),
      taxRate: num("tax_rate", DEFAULTS.taxRate),
      dealerDiscountPct: num("dealer_discount_pct", DEFAULTS.dealerDiscountPct),
    };
  } catch {
    return DEFAULTS;
  }
}

/** Cached across requests; busted immediately when an admin saves a change. */
export const getSiteSettings = unstable_cache(readSettings, ["site-settings"], {
  tags: [SETTINGS_TAG],
  revalidate: 300,
});
