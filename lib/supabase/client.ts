import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser/anon Supabase client. Safe to import from client components — it uses
 * the public anon key and relies on Row Level Security for access control.
 *
 * Not used yet: the catalog reads mock data (see lib/catalog.ts). When you're
 * ready to connect, fill in .env.local and switch the getters over.
 */
let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Supabase env vars are missing. Copy .env.example to .env.local and fill them in."
    );
  }
  cached = createClient(url, anon);
  return cached;
}
