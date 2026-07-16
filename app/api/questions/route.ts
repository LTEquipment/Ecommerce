import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { getProduct } from "@/lib/catalog";
import { getProductQuestions, type Question } from "@/lib/questions";
import { deriveAuthorName } from "@/lib/reviews";

export const runtime = "nodejs";

const clampStr = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** GET /api/questions?slug=… — published questions (used to refresh after asking). */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") || "";
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  const questions: Question[] = await getProductQuestions(slug);
  return NextResponse.json({ questions });
}

/**
 * POST /api/questions  { slug, question }
 * Any signed-in customer may ask. Written via the service role, which snapshots a
 * privacy-preserving author name (never the email). Auto-publishes.
 */
export async function POST(req: Request) {
  const sb = await getServerSupabase();
  if (!sb) return NextResponse.json({ error: "Backend not connected" }, { status: 500 });
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to ask a question" }, { status: 401 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const b = (raw ?? {}) as { slug?: unknown; question?: unknown };
  const slug = clampStr(b.slug, 100);
  const product = slug ? await getProduct(slug) : null;
  if (!product) return NextResponse.json({ error: "Unknown product" }, { status: 400 });
  const question = clampStr(b.question, 1000);
  if (question.length < 5) return NextResponse.json({ error: "Please write your question" }, { status: 400 });

  const author_name = deriveAuthorName(user.user_metadata as Record<string, unknown>);
  const svc = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Soft rate limit — no one legitimately asks a dozen questions a minute.
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count: recent } = await svc
    .from("product_questions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);
  if ((recent ?? 0) >= 8) {
    return NextResponse.json({ error: "Too many questions — please wait a moment." }, { status: 429 });
  }

  const { error } = await svc
    .from("product_questions")
    .insert({ product_slug: slug, user_id: user.id, author_name, question, status: "published" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath(`/products/${slug}`);
  return NextResponse.json({ ok: true });
}
