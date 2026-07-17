import { redirect } from "next/navigation";

// /register is an alias for the create-account form. Forward to the auth form in
// register mode, preserving next/trade so links like /register?trade=1 work.
export default async function RegisterPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams({ mode: "register" });
  if (typeof sp.next === "string") qs.set("next", sp.next);
  if (typeof sp.trade === "string") qs.set("trade", sp.trade);
  redirect(`/login?${qs.toString()}`);
}
