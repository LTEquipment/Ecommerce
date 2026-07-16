import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getProduct } from "@/lib/catalog";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/notify-stock  { slug, email }
 * Registers a back-in-stock alert. Public (anyone may ask), deduped per
 * product+email. The product is validated against the catalog; the email is
 * validated and stored so an admin can notify when the item returns.
 */
export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.json({ error: "Backend not connected" }, { status: 500 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const b = (body ?? {}) as { slug?: unknown; email?: unknown };
  const slug = typeof b.slug === "string" ? b.slug.trim().slice(0, 100) : "";
  const email = typeof b.email === "string" ? b.email.trim().slice(0, 200) : "";
  if (!slug) return NextResponse.json({ error: "Missing product" }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });

  const product = await getProduct(slug);
  if (!product) return NextResponse.json({ error: "Unknown product" }, { status: 400 });

  const sb = createClient(url, anon, { auth: { persistSession: false } });
  const { error } = await sb
    .from("stock_notifications")
    .upsert(
      { product_slug: slug, sku: product.sku, email },
      { onConflict: "product_slug,email", ignoreDuplicates: true }
    );
  if (error) return NextResponse.json({ error: "Could not save your request" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
