import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon);

/**
 * Server Supabase client for Server Components / Route Handlers. Reads the
 * session from cookies. Returns null if env vars are missing. Cookie writes are
 * wrapped in try/catch because Server Components cannot set cookies (middleware
 * refreshes the session instead).
 */
export async function getServerSupabase(): Promise<SupabaseClient | null> {
  if (!supabaseConfigured) return null;
  const cookieStore = await cookies();
  return createServerClient(url!, anon!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* called from a Server Component — ignore */
        }
      },
    },
  });
}
