import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import { getProducts } from "@/lib/catalog";

export const runtime = "nodejs";

const round2 = (n: number) => Math.round(n * 100) / 100;
const clampStr = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/quotes  { items:[{sku,qty}], name, company, email, phone, notes }
 * Submits a cart for a formal quote. Guests allowed (email required). Prices and
 * names are recomputed from the catalog — client prices are never trusted. Runs
 * with the service-role key; customer_id is linked from the session when present.
 */
export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const srv = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !srv) return NextResponse.json({ error: "Backend not connected" }, { status: 500 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const b = (body ?? {}) as {
    items?: unknown;
    name?: unknown;
    company?: unknown;
    email?: unknown;
    phone?: unknown;
    notes?: unknown;
  };

  const reqItems = Array.isArray(b.items) ? (b.items as Array<{ sku?: unknown; qty?: unknown }>) : [];
  if (reqItems.length === 0) return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  if (reqItems.length > 100) return NextResponse.json({ error: "Too many line items" }, { status: 400 });

  const email = clampStr(b.email, 200);
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  const name = clampStr(b.name, 120) || null;
  const company = clampStr(b.company, 200) || null;
  const phone = clampStr(b.phone, 40) || null;
  const notes = clampStr(b.notes, 2000) || null;

  // Authoritative prices from the catalog — never trust client-sent prices.
  const catalog = await getProducts();
  const bySku = new Map(catalog.map((p) => [p.sku, p]));
  let subtotal = 0;
  const lines: Array<{ sku: string; name: string; unit_price: number; qty: number }> = [];
  for (const it of reqItems) {
    const qty = Math.max(1, Math.min(999, Math.floor(Number(it?.qty) || 0)));
    const p = bySku.get(String(it?.sku));
    if (!p) continue; // silently drop items no longer in the catalog
    subtotal += p.price * qty;
    lines.push({ sku: p.sku, name: p.name, unit_price: p.price, qty });
  }
  if (lines.length === 0) return NextResponse.json({ error: "No valid items to quote" }, { status: 400 });
  subtotal = round2(subtotal);

  // Link the customer when signed in (optional — guests are allowed).
  let customerId: string | null = null;
  const sb = await getServerSupabase();
  if (sb) {
    const {
      data: { user },
    } = await sb.auth.getUser();
    customerId = user?.id ?? null;
  }

  const admin = createClient(url, srv, { auth: { persistSession: false } });

  // Soft rate limit per email — stop a script flooding requests.
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count: recent } = await admin
    .from("quote_requests")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", since);
  if ((recent ?? 0) >= 6) {
    return NextResponse.json({ error: "Too many requests — please wait a moment." }, { status: 429 });
  }

  const { data: quote, error } = await admin
    .from("quote_requests")
    .insert({ customer_id: customerId, name, company, email, phone, notes, subtotal, status: "new" })
    .select("id")
    .single();
  if (error || !quote) return NextResponse.json({ error: "Could not submit your request" }, { status: 500 });

  const { error: liErr } = await admin
    .from("quote_request_items")
    .insert(lines.map((l) => ({ ...l, quote_id: quote.id })));
  if (liErr) return NextResponse.json({ error: "Could not save the items" }, { status: 500 });

  return NextResponse.json({ id: quote.id });
}
