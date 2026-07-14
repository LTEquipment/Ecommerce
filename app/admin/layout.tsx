import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

// Server-side authorization gate for the whole /admin area (defense-in-depth on
// top of the client guard and per-table RLS). The admin shell and its data-fetch
// code never render for a non-admin visitor.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerSupabase();
  if (!supabase) redirect("/login?next=/admin");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) redirect("/login?next=/admin");

  return <>{children}</>;
}
