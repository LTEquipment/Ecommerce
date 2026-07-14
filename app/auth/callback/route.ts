import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

// Exchanges the OAuth code for a session after a provider redirect
// (used by social account linking). Then returns to the requested page.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/account";
  if (code) {
    const supabase = await getServerSupabase();
    if (supabase) await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
