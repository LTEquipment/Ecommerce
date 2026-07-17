import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** A published, publicly-visible review. Never carries the reviewer's email. */
export type Review = {
  id: string;
  product_slug: string;
  rating: number;
  title: string | null;
  body: string;
  author_name: string;
  verified: boolean;
  created_at: string;
};

/** The caller's own review (may be hidden), used to gate the write form. */
export type MyReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  status: string;
  created_at: string;
};

export type ReviewStats = { avg: number; count: number };

export type ReviewEligibility = {
  loggedIn: boolean;
  /** True only for a verified purchaser who has not yet reviewed this product. */
  canReview: boolean;
  alreadyReviewed: boolean;
  mine: MyReview | null;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Cookieless anon client — reads respect RLS (published reviews only). */
function anonClient(): SupabaseClient | null {
  if (!url || !anon) return null;
  return createClient(url, anon, { auth: { persistSession: false } });
}

/** Service-role client — bypasses RLS. Used ONLY for verified writes. */
export function reviewServiceClient(): SupabaseClient {
  return createClient(url!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

/** Published reviews for a product, newest first. Public. */
export async function getProductReviews(slug: string): Promise<Review[]> {
  const sb = anonClient();
  if (!sb) return [];
  const { data } = await sb
    .from("product_reviews")
    .select("id,product_slug,rating,title,body,author_name,verified,created_at")
    .eq("product_slug", slug)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data as Review[]) ?? [];
}

/** Aggregate rating for one product (published only); null when there are none. */
export async function getReviewStats(slug: string): Promise<ReviewStats | null> {
  const sb = anonClient();
  if (!sb) return null;
  const { data } = await sb
    .from("product_review_stats")
    .select("avg_rating,review_count")
    .eq("product_slug", slug)
    .maybeSingle();
  if (!data || !data.review_count) return null;
  return { avg: Number(data.avg_rating), count: Number(data.review_count) };
}

/**
 * Order statuses that represent a STAFF-CONFIRMED purchase. Any signed-in user
 * can self-create an order server-side — it lands as "submitted" with no payment
 * (the wire/PO flow), so "submitted" must NOT confer verified-purchase rights or
 * anyone could fabricate a "Verified Purchase" review by placing a free order.
 * Only an admin can advance an order past "submitted" (RLS: no client UPDATE on
 * orders), so these fulfillment states are the trustworthy signal. Status-based
 * (not payment_status) because payment is collected offline, so paid orders sit
 * at "processing"/"shipped"/"delivered" rather than payment_status='paid'.
 */
const PURCHASED_STATUSES = ["processing", "shipped", "delivered"];

/**
 * Has this user purchased the product? Verified against order_items.sku for the
 * user's own STAFF-CONFIRMED orders. Accepts any Supabase client scoped to the
 * user (RLS lets a user read their own orders/order_items), so callers pass the
 * session client.
 */
export async function hasPurchased(
  sb: SupabaseClient,
  userId: string,
  sku: string
): Promise<boolean> {
  const { data: orders } = await sb
    .from("orders")
    .select("id")
    .eq("customer_id", userId)
    .in("status", PURCHASED_STATUSES);
  const ids = (orders ?? []).map((o) => o.id as string);
  if (ids.length === 0) return false;
  const { data: items } = await sb
    .from("order_items")
    .select("id")
    .eq("sku", sku)
    .in("order_id", ids)
    .limit(1);
  return (items?.length ?? 0) > 0;
}

/**
 * Privacy-preserving display name from auth metadata: "James Rivera" → "James R."
 * Any email-like token is dropped so an email address can NEVER be published
 * (a single-token name field set to an email would otherwise leak verbatim).
 * Unknowns — or a value that is only an email — show as "Verified buyer".
 */
export function deriveAuthorName(meta: Record<string, unknown> | null | undefined): string {
  const raw = String((meta?.full_name ?? meta?.name ?? meta?.first_name ?? "") ?? "").trim();
  // Never emit an email: strip any token containing "@" before reducing to initials.
  const tokens = raw.split(/\s+/).filter((t) => t && !t.includes("@"));
  if (tokens.length === 0) return "Verified buyer";
  const first = tokens[0];
  const last = tokens.length > 1 ? tokens[tokens.length - 1] : "";
  const lastInitial = last ? ` ${last[0].toUpperCase()}.` : "";
  return `${first}${lastInitial}`;
}
