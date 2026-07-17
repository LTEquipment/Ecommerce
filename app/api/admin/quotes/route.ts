import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

function serviceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function requireAdmin() {
  const sb = await getServerSupabase();
  if (!sb) return null;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return data ? user : null;
}

const STATUSES = ["new", "quoted", "won", "lost"];

/** GET /api/admin/quotes — every quote request with its line items. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const svc = serviceClient();
  // select * so converted_order_id loads when present (migration-resilient).
  const { data } = await svc
    .from("quote_requests")
    .select("*, quote_request_items(sku,name,unit_price,qty)")
    .order("created_at", { ascending: false })
    .limit(500);
  return NextResponse.json({ quotes: data ?? [] });
}

/** POST /api/admin/quotes  { id, status } */
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id, status } = (await req.json().catch(() => ({}))) as { id?: string; status?: string };
  if (!id || !STATUSES.includes(status || "")) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const svc = serviceClient();
  const { data, error } = await svc.from("quote_requests").update({ status }).eq("id", id).select("id,company,name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const label = data[0].company || data[0].name || id.slice(0, 8);
  await svc
    .from("audit_log")
    .insert({ actor_id: admin.id, actor_email: admin.email, action: "quote.status", target: label, detail: `Marked ${status}` })
    .then(() => {}, () => {});
  return NextResponse.json({ ok: true });
}
