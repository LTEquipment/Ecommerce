import type { User } from "@supabase/supabase-js";
import { getBrowserSupabase } from "./supabase/browser";

/**
 * Record an admin action to the audit_log. Best-effort: if the table is missing
 * or the write fails, it silently no-ops so the primary action is never blocked.
 */
export async function logAudit(user: User | null, action: string, target: string, detail: string) {
  const sb = getBrowserSupabase();
  if (!sb || !user) return;
  try {
    await sb.from("audit_log").insert({ actor_id: user.id, actor_email: user.email ?? null, action, target, detail });
  } catch {
    /* audit is non-critical */
  }
}
