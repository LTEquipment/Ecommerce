import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { syncCatalogFromErp, erpCatalogConfigured } from "@/lib/erpCatalog";

export const runtime = "nodejs";

/** Only real admins (present in the `admins` table) may run a sync. */
async function requireAdmin() {
  const sb = await getServerSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return data ? user : null;
}

/** GET — is the sync configured, without running it. */
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ configured: erpCatalogConfigured() });
}

/**
 * POST — pull ERP prices and stock onto listed products.
 *
 * Defaults to a dry run: this writes to every product the storefront sells, so
 * the safe default is to show what would change and make the real run explicit.
 *   { dryRun: false }            apply
 *   { syncCopy: true }           also overwrite name/brand/description
 */
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { dryRun?: boolean; syncCopy?: boolean };
  const dryRun = body.dryRun !== false;

  const report = await syncCatalogFromErp({ dryRun, syncCopy: body.syncCopy === true });
  if (!report.ok) return NextResponse.json({ ...report, dryRun }, { status: 502 });
  return NextResponse.json({ ...report, dryRun });
}
