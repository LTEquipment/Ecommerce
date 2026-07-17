import { NextResponse } from "next/server";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";

function serviceClient(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

// Only real admins (present in the `admins` table) may hit these endpoints.
async function requireAdmin() {
  const sb = await getServerSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return data ? user : null;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const svc = serviceClient();

  const users: User[] = [];
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    users.push(...data.users);
    if (data.users.length < 200) break;
  }

  const { data: adminRows } = await svc.from("admins").select("user_id");
  const adminSet = new Set((adminRows ?? []).map((a) => a.user_id));

  const customers = users
    .map((u) => {
      const m = (u.user_metadata ?? {}) as Record<string, string>;
      const am = (u.app_metadata ?? {}) as Record<string, unknown>;
      return {
        id: u.id,
        email: u.email ?? "",
        company: m.company || "",
        role: (m.role as string) || "customer",
        // Authoritative status lives in app_metadata (server-set); user_metadata
        // is only a self-writable display hint for the pending state.
        dealerStatus: (am.dealer_status as string) || (m.dealer_status as string) || null,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        confirmed: Boolean(u.email_confirmed_at),
        isAdmin: adminSet.has(u.id),
      };
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return NextResponse.json({ customers });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, action } = (await req.json().catch(() => ({}))) as { userId?: string; action?: string };
  if (!userId || !action) return NextResponse.json({ error: "Missing userId or action" }, { status: 400 });
  const svc = serviceClient();

  const { data: tgt } = await svc.auth.admin.getUserById(userId);
  const targetEmail = tgt.user?.email ?? userId.slice(0, 8);
  let auditAction = "";
  let detail = "";

  if (action === "approve-dealer" || action === "reject-dealer") {
    const status = action === "approve-dealer" ? "approved" : "rejected";
    const md = {
      ...((tgt.user?.user_metadata ?? {}) as Record<string, unknown>),
      role: "dealer",
      dealer_status: status,
    };
    // Authoritative entitlement goes in app_metadata — only settable with the
    // service-role key, so a user can't self-approve via updateUser().
    const am = { ...((tgt.user?.app_metadata ?? {}) as Record<string, unknown>), dealer_status: status };
    const { error } = await svc.auth.admin.updateUserById(userId, { user_metadata: md, app_metadata: am });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    auditAction = action === "approve-dealer" ? "dealer.approve" : "dealer.reject";
    detail = `Trade account ${action === "approve-dealer" ? "approved" : "rejected"}`;
  } else if (action === "grant-admin") {
    const { error } = await svc.from("admins").upsert({ user_id: userId }, { onConflict: "user_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    auditAction = "admin.grant";
    detail = "Granted admin access";
  } else if (action === "revoke-admin") {
    if (userId.toLowerCase() === admin.id.toLowerCase()) return NextResponse.json({ error: "You can't revoke your own admin access." }, { status: 400 });
    const { error } = await svc.from("admins").delete().eq("user_id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    auditAction = "admin.revoke";
    detail = "Revoked admin access";
  } else if (action === "send-reset") {
    // Send a password-RESET email — the user sets their own new password. Staff
    // never see or set it. Mirrors the self-service /reset-password redirect.
    if (!tgt.user?.email) return NextResponse.json({ error: "This account has no email address." }, { status: 400 });
    const origin = new URL(req.url).origin;
    const { error } = await svc.auth.resetPasswordForEmail(tgt.user.email, { redirectTo: `${origin}/reset-password` });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    auditAction = "user.reset_sent";
    detail = "Sent a password-reset email";
  } else if (action === "resend-confirmation") {
    if (!tgt.user?.email) return NextResponse.json({ error: "This account has no email address." }, { status: 400 });
    if (tgt.user.email_confirmed_at) return NextResponse.json({ error: "This email is already confirmed." }, { status: 400 });
    const { error } = await svc.auth.resend({ type: "signup", email: tgt.user.email });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    auditAction = "user.confirmation_resent";
    detail = "Resent the confirmation email";
  } else if (action === "confirm-email") {
    // Manually confirm — for when email delivery fails and resend won't land.
    if (tgt.user?.email_confirmed_at) return NextResponse.json({ error: "This email is already confirmed." }, { status: 400 });
    const { error } = await svc.auth.admin.updateUserById(userId, { email_confirm: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    auditAction = "user.email_confirmed";
    detail = "Manually confirmed the email";
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  await svc.from("audit_log").insert({ actor_id: admin.id, actor_email: admin.email, action: auditAction, target: targetEmail, detail }).then(() => {}, () => {});

  return NextResponse.json({ ok: true });
}
