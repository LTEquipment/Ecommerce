import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/safeNext";

// Exchanges the OAuth code for a session after a provider redirect
// (used by social account linking). Then returns to the requested page.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  // Only internal same-origin paths — prevents open-redirect to attacker sites.
  const next = safeInternalPath(url.searchParams.get("next"));
  if (code) {
    const supabase = await getServerSupabase();
    if (supabase) await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
