import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { SETTINGS_TAG } from "@/lib/settings";

function serviceClient(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

// Only real admins (present in the `admins` table) may hit these endpoints.
async function requireAdmin() {
  const sb = await getServerSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return data ? user : null;
}

// Keys the admin UI is allowed to write (all boolean flags).
const BOOLEAN_KEYS = new Set(["investor_relations_enabled"]);
// Numeric settings with [min, max] validation ranges.
const NUMERIC_KEYS: Record<string, [number, number]> = {
  freight_threshold: [0, 1_000_000],
  freight_fee: [0, 100_000],
  tax_rate: [0, 0.25],
  dealer_discount_pct: [0, 90],
};

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const svc = serviceClient();
  const { data } = await svc.from("site_settings").select("key,value");
  const settings = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  return NextResponse.json({ settings });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { key, value } = (await req.json().catch(() => ({}))) as { key?: string; value?: unknown };
  const isBool = !!key && BOOLEAN_KEYS.has(key);
  const isNum = !!key && key in NUMERIC_KEYS;
  if (!key || (!isBool && !isNum)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }
  let stored: boolean | number;
  if (isBool) {
    if (typeof value !== "boolean") return NextResponse.json({ error: "Expected a boolean" }, { status: 400 });
    stored = value;
  } else {
    const n = Number(value);
    const [min, max] = NUMERIC_KEYS[key];
    if (!Number.isFinite(n) || n < min || n > max) {
      return NextResponse.json({ error: `Value must be between ${min} and ${max}` }, { status: 400 });
    }
    stored = n;
  }

  const svc = serviceClient();
  const { error } = await svc
    .from("site_settings")
    .upsert({ key, value: stored, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await svc
    .from("audit_log")
    .insert({ actor_id: admin.id, actor_email: admin.email, action: "settings.update", target: key, detail: `Set ${key} = ${stored}` })
    .then(() => {}, () => {});

  // Next 16: revalidateTag now takes a profile. { expire: 0 } expires the tag
  // immediately so the toggle takes effect on the very next request (this is a
  // Route Handler, not a Server Action, so updateTag isn't available here).
  revalidateTag(SETTINGS_TAG, { expire: 0 });
  return NextResponse.json({ ok: true });
}
