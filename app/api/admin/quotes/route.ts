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
  const { data } = await svc
    .from("quote_requests")
    .select("id,created_at,name,company,email,phone,notes,subtotal,status,quote_request_items(sku,name,unit_price,qty)")
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
  await svc.from("quote_requests").update({ status }).eq("id", id);
  await svc
    .from("audit_log")
    .insert({ actor_id: admin.id, actor_email: admin.email, action: `quote.${status}`, target: id })
    .then(() => {}, () => {});
  return NextResponse.json({ ok: true });
}
