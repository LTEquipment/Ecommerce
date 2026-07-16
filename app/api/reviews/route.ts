import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { getProduct } from "@/lib/catalog";
import {
  getProductReviews,
  getReviewStats,
  hasPurchased,
  reviewServiceClient,
  deriveAuthorName,
  type ReviewEligibility,
  type MyReview,
} from "@/lib/reviews";

export const runtime = "nodejs";

const clampStr = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/**
 * GET /api/reviews?slug=…
 * Public: published reviews + aggregate stats. If the caller is signed in, also
 * returns their eligibility (verified purchaser, not yet reviewed) and their own
 * review, so the client can show the write form or an "edit your review" state.
 */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") || "";
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const [reviews, stats] = await Promise.all([getProductReviews(slug), getReviewStats(slug)]);

  const eligibility: ReviewEligibility = {
    loggedIn: false,
    canReview: false,
    alreadyReviewed: false,
    mine: null,
  };

  const sb = await getServerSupabase();
  if (sb) {
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (user) {
      eligibility.loggedIn = true;
      const product = await getProduct(slug);
      // Own review is readable under RLS (auth.uid() = user_id), even if hidden.
      const { data: mine } = await sb
        .from("product_reviews")
        .select("id,rating,title,body,status,created_at")
        .eq("product_slug", slug)
        .eq("user_id", user.id)
        .maybeSingle();
      eligibility.mine = (mine as MyReview) ?? null;
      eligibility.alreadyReviewed = Boolean(mine);
      const purchased = product ? await hasPurchased(sb, user.id, product.sku) : false;
      eligibility.canReview = purchased && !mine;
    }
  }

  return NextResponse.json({ reviews, stats, eligibility });
}

/**
 * POST /api/reviews  { slug, rating, title?, body }
 * Creates or updates the caller's review. Requires auth AND a verified purchase
 * (order_items.sku match). Auto-publishes; the write goes through the service
 * role because there is no client write policy on product_reviews.
 */
export async function POST(req: Request) {
  const sb = await getServerSupabase();
  if (!sb) return NextResponse.json({ error: "Backend not connected" }, { status: 500 });
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const b = (raw ?? {}) as { slug?: unknown; rating?: unknown; title?: unknown; body?: unknown };

  const slug = clampStr(b.slug, 100);
  const product = slug ? await getProduct(slug) : null;
  if (!product) return NextResponse.json({ error: "Unknown product" }, { status: 400 });

  const rating = Math.floor(Number(b.rating));
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }
  const title = clampStr(b.title, 120) || null;
  const body = clampStr(b.body, 4000);
  if (body.length < 3) return NextResponse.json({ error: "Please write a few words" }, { status: 400 });

  // Verified-purchaser gate — the whole point of the feature.
  const purchased = await hasPurchased(sb, user.id, product.sku);
  if (!purchased) {
    return NextResponse.json(
      { error: "Only verified purchasers can review this product." },
      { status: 403 }
    );
  }

  const author_name = deriveAuthorName(user.user_metadata as Record<string, unknown>);

  const svc = reviewServiceClient();
  const cols = "id,product_slug,rating,title,body,author_name,verified,created_at";

  // Editing must NEVER change moderation status: only a fresh insert publishes.
  // An update preserves the existing status, so an admin-hidden review stays
  // hidden even if its author re-submits it.
  const { data: existing } = await svc
    .from("product_reviews")
    .select("id")
    .eq("product_slug", slug)
    .eq("user_id", user.id)
    .maybeSingle();

  const query = existing
    ? svc
        .from("product_reviews")
        .update({ rating, title, body, author_name, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select(cols)
        .single()
    : svc
        .from("product_reviews")
        .insert({
          product_slug: slug,
          user_id: user.id,
          rating,
          title,
          body,
          author_name,
          verified: true,
          status: "published",
        })
        .select(cols)
        .single();

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath(`/products/${slug}`);
  return NextResponse.json({ ok: true, review: data });
}

/** DELETE /api/reviews?slug=…  — remove the caller's own review. */
export async function DELETE(req: Request) {
  const sb = await getServerSupabase();
  if (!sb) return NextResponse.json({ error: "Backend not connected" }, { status: 500 });
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const slug = new URL(req.url).searchParams.get("slug") || "";
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const svc = reviewServiceClient();
  const { error } = await svc
    .from("product_reviews")
    .delete()
    .eq("product_slug", slug)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath(`/products/${slug}`);
  return NextResponse.json({ ok: true });
}
