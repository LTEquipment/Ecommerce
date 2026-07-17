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

async function requireUser() {
  const sb = await getServerSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  return user ?? null;
}

const OPEN = ["pending", "processing"];
/** The column-missing / table-missing shape Postgres/PostgREST returns pre-migration. */
const notMigrated = (msg?: string) => !!msg && /relation|does not exist|schema cache|column/i.test(msg);

/**
 * POST /api/account/deletion-request  { reason? }
 * Records the signed-in user's request to have their account deleted. This is a
 * request queue reviewed by staff — nothing is deleted here. Idempotent: an
 * existing open request is returned rather than duplicated.
 */
export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const svc = serviceClient();
  if (!svc) return NextResponse.json({ error: "Backend not connected" }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { reason?: unknown };
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 1000) || null : null;

  // Return the existing open request instead of creating a duplicate.
  const { data: existing, error: readErr } = await svc
    .from("account_deletion_requests")
    .select("id, status, created_at")
    .eq("user_id", user.id)
    .in("status", OPEN)
    .maybeSingle();
  if (readErr && notMigrated(readErr.message)) {
    return NextResponse.json({ error: "This feature isn't enabled yet.", notEnabled: true }, { status: 501 });
  }
  if (existing) {
    return NextResponse.json({ ok: true, request: existing, already: true });
  }

  const { data, error } = await svc
    .from("account_deletion_requests")
    .insert({ user_id: user.id, email: user.email ?? null, reason })
    .select("id, status, created_at")
    .single();
  if (error) {
    if (notMigrated(error.message)) {
      return NextResponse.json({ error: "This feature isn't enabled yet.", notEnabled: true }, { status: 501 });
    }
    // Unique-index race: an open request already exists — treat as success.
    if (/duplicate key|unique/i.test(error.message)) {
      return NextResponse.json({ ok: true, already: true });
    }
    return NextResponse.json({ error: "Could not submit your request." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, request: data });
}

/**
 * DELETE /api/account/deletion-request
 * Cancels the signed-in user's own open request. Uses the service role but pins
 * the update to this user's id, so a user can only cancel their own.
 */
export async function DELETE() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const svc = serviceClient();
  if (!svc) return NextResponse.json({ error: "Backend not connected" }, { status: 500 });

  const { error } = await svc
    .from("account_deletion_requests")
    .update({ status: "cancelled", processed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .in("status", OPEN);
  if (error && !notMigrated(error.message)) {
    return NextResponse.json({ error: "Could not cancel your request." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
