import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function serviceClient(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}

/**
 * POST /api/orders/lookup  { id, email }
 * Guest-safe order lookup for the confirmation and tracking pages. Returns an
 * order (with items + tracking) only when the supplied email matches the order's
 * guest_email or the owning customer's account email — so a bare order id can't
 * be enumerated. Runs with the service-role key (guests have no session).
 */
export async function POST(req: Request) {
  const { id, email } = (await req.json().catch(() => ({}))) as { id?: string; email?: string };
  const e = (email ?? "").trim().toLowerCase();
  const raw = (id ?? "").trim().toLowerCase();
  if (!raw || !EMAIL_RE.test(e)) return NextResponse.json({ error: "Order number and email are required" }, { status: 400 });

  const svc = serviceClient();
  // select * so ship_/guest_/tracking columns load when present (migration-resilient).
  let q = svc.from("orders").select("*, order_items(name, sku, unit_price, qty)").limit(20);
  if (/^[0-9a-f]{8}$/.test(raw)) {
    // The 8-char short number shown across the app = the uuid's first block; match
    // it as a range on the uuid (collisions across 4B values are negligible here).
    q = q.gte("id", `${raw}-0000-0000-0000-000000000000`).lte("id", `${raw}-ffff-ffff-ffff-ffffffffffff`);
  } else {
    q = q.eq("id", raw); // full uuid
  }
  const { data: candidates } = await q;
  if (!candidates || candidates.length === 0) return NextResponse.json({ error: "No order found — check the number and email." }, { status: 404 });

  const ownerEmail = async (customerId: string | null) => {
    if (!customerId) return "";
    const { data } = await svc.auth.admin.getUserById(customerId).catch(() => ({ data: null }) as never);
    return ((data?.user?.email as string) ?? "").toLowerCase();
  };

  for (const order of candidates) {
    if (((order.guest_email as string) ?? "").toLowerCase() === e) return NextResponse.json({ order });
    if (order.customer_id && (await ownerEmail(order.customer_id as string)) === e) return NextResponse.json({ order });
  }
  return NextResponse.json({ error: "No order found — check the number and email." }, { status: 404 });
}
