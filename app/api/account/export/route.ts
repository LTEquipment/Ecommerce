import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Await a Supabase query and return its rows, degrading to [] on any error
 * (missing table before a migration, RLS deny, network). One failing table
 * must never sink the whole export.
 */
async function rows<T>(q: PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  try {
    const { data } = await q;
    return data ?? [];
  } catch {
    return [];
  }
}

/**
 * GET /api/account/export
 * Streams a JSON copy of the signed-in user's own data (CCPA/GDPR access right).
 * Read-only, scoped to the caller: the session client means every table is
 * filtered by RLS to the user's own rows, and orders are additionally pinned to
 * their customer_id.
 */
export async function GET() {
  const sb = await getServerSupabase();
  if (!sb) return NextResponse.json({ error: "Backend not connected" }, { status: 500 });

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const [orders, addresses, savedLists, claims, registrations, tickets] = await Promise.all([
    rows(sb.from("orders").select("*, order_items(*)").eq("customer_id", user.id).order("created_at", { ascending: false })),
    rows(sb.from("customer_addresses").select("*")),
    rows(sb.from("saved_lists").select("*, saved_list_items(*)")),
    rows(sb.from("warranty_claims").select("*")),
    rows(sb.from("warranty_registrations").select("*")),
    rows(sb.from("service_tickets").select("*")),
  ]);

  const payload = {
    export: {
      generated_at: new Date().toISOString(),
      site: "ltfse.com",
      note: "A copy of the personal data L&T Restaurant Equipment holds for your account.",
    },
    account: {
      id: user.id,
      email: user.email ?? null,
      created_at: user.created_at,
      sign_in_providers: (user.identities ?? []).map((i) => i.provider),
      profile: user.user_metadata ?? {},
    },
    orders,
    addresses,
    saved_lists: savedLists,
    warranty_claims: claims,
    warranty_registrations: registrations,
    service_tickets: tickets,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ltfse-account-data.json"',
      "Cache-Control": "no-store",
    },
  });
}
