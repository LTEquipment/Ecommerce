import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Cache tag — the admin settings API revalidates this after a write. */
export const SETTINGS_TAG = "site-settings";

export type SiteSettings = {
  /** When false, the Investor Relations page (404s) and its nav links are hidden. */
  investorRelationsEnabled: boolean;
};

/**
 * Safe defaults, used when Supabase is unavailable or a key is unset. Investor
 * Relations is OFF by default — it stays hidden until an admin turns it on, so a
 * pre-IPO company never publishes investor content prematurely.
 */
const DEFAULTS: SiteSettings = { investorRelationsEnabled: false };

async function readSettings(): Promise<SiteSettings> {
  if (!url || !anon) return DEFAULTS;
  try {
    // Plain anon client (no cookies) so this read is cacheable and never forces
    // dynamic rendering. site_settings is world-readable (RLS: public select).
    const sb = createClient(url, anon, { auth: { persistSession: false } });
    const { data, error } = await sb.from("site_settings").select("key,value");
    if (error || !data) return DEFAULTS;
    const map = new Map(data.map((r) => [r.key as string, r.value]));
    return {
      investorRelationsEnabled: map.get("investor_relations_enabled") === true,
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
