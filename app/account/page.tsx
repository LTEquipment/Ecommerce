import { Suspense } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import AccountDashboard from "@/components/AccountDashboard";

export const metadata = { title: "Account — L&T" };

export default function AccountPage() {
  return (
    <>
      <div className="wrap"><Breadcrumbs items={[{ label: "Account" }]} /></div>
      <Suspense fallback={<div className="wrap" style={{ padding: "var(--s7) 0", color: "var(--muted)" }}>Loading…</div>}>
        <AccountDashboard />
      </Suspense>
    </>
  );
}
