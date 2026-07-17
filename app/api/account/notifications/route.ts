import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

function serviceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** The signed-in user's email, or null. */
async function currentEmail(): Promise<string | null> {
  const sb = await getServerSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  return user?.email ?? null;
}

/**
 * Marketing-email subscription for the signed-in user, backed by the existing
 * `subscribers` newsletter list. `subscribers` is insert-anyone / read-admin
 * under RLS, so a user can't read or remove their own row client-side — this
 * route does it with the service role, pinned to the caller's OWN email, so a
 * user can only ever change their own subscription.
 */
export async function GET() {
  const email = await currentEmail();
  if (!email) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const svc = serviceClient();
  if (!svc) return NextResponse.json({ subscribed: false });

  const { data, error } = await svc.from("subscribers").select("email").eq("email", email).maybeSingle();
  if (error) return NextResponse.json({ subscribed: false });
  return NextResponse.json({ subscribed: !!data });
}

export async function POST(req: Request) {
  const email = await currentEmail();
  if (!email) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const svc = serviceClient();
  if (!svc) return NextResponse.json({ error: "Backend not connected" }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { subscribed?: unknown };
  const subscribed = body.subscribed === true;

  const { error } = subscribed
    ? await svc.from("subscribers").upsert({ email }, { onConflict: "email" })
    : await svc.from("subscribers").delete().eq("email", email);
  if (error) return NextResponse.json({ error: "Could not update your preferences." }, { status: 500 });

  return NextResponse.json({ ok: true, subscribed });
}
