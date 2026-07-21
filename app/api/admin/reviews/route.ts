import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { isMissingRelation } from "@/lib/migrationGate";

export const runtime = "nodejs";

function serviceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Only real admins (present in the `admins` table) may hit these endpoints.
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

/** GET /api/admin/reviews — every review incl. hidden, newest first. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const svc = serviceClient();
  const { data, error } = await svc
    .from("product_reviews")
    .select("id,product_slug,rating,title,body,author_name,verified,status,created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  // Distinguish "no reviews" from "product-reviews.sql was never run", so the
  // admin can say which it is instead of showing an empty list either way.
  return NextResponse.json({ reviews: data ?? [], notEnabled: isMissingRelation(error) });
}

/** POST /api/admin/reviews  { id, action: 'hide' | 'publish' | 'delete' } */
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, action } = (await req.json().catch(() => ({}))) as {
    id?: string;
    action?: string;
  };
  if (!id || !["hide", "publish", "delete"].includes(action || "")) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const svc = serviceClient();
  const { data: row } = await svc
    .from("product_reviews")
    .select("product_slug")
    .eq("id", id)
    .maybeSingle();

  if (action === "delete") {
    await svc.from("product_reviews").delete().eq("id", id);
  } else {
    await svc
      .from("product_reviews")
      .update({ status: action === "hide" ? "hidden" : "published", updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  await svc
    .from("audit_log")
    .insert({
      actor_id: admin.id,
      actor_email: admin.email,
      action: `review.${action}`,
      target: row?.product_slug ?? id,
      detail: action === "hide" ? "Hid a review" : action === "publish" ? "Published a review" : "Deleted a review",
    })
    .then(() => {}, () => {});

  if (row?.product_slug) revalidatePath(`/products/${row.product_slug}`);
  return NextResponse.json({ ok: true });
}
