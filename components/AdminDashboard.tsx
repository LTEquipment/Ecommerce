"use client";

import { useEffect, useState, type SVGProps, type ReactNode, type ReactElement } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { LogOut, TrendingUp, Package, Cart, User, Shield, Mail, FileText, Settings, Star, Chat } from "./icons";
import AdminAnalytics from "./admin/AdminAnalytics";
import AdminCatalog from "./admin/AdminCatalog";
import AdminOrders from "./admin/AdminOrders";
import AdminCustomers from "./admin/AdminCustomers";
import AdminService from "./admin/AdminService";
import AdminInbox from "./admin/AdminInbox";
import AdminQuotes from "./admin/AdminQuotes";
import AdminReviews from "./admin/AdminReviews";
import AdminQA from "./admin/AdminQA";
import AdminAudit from "./admin/AdminAudit";
import AdminSettings from "./admin/AdminSettings";
import { BACKEND_OFFLINE_ADMIN } from "@/lib/backendMessage";

type Tab = "overview" | "catalog" | "orders" | "customers" | "service" | "quotes" | "inbox" | "reviews" | "qa" | "audit" | "settings";
type IconC = (p: SVGProps<SVGSVGElement>) => ReactElement;
const TABS: { id: Tab; label: string; Icon: IconC }[] = [
  { id: "overview", label: "Overview", Icon: TrendingUp },
  { id: "catalog", label: "Catalog", Icon: Package },
  { id: "orders", label: "Orders", Icon: Cart },
  { id: "customers", label: "Customers", Icon: User },
  { id: "service", label: "Warranty & service", Icon: Shield },
  { id: "quotes", label: "Quotes", Icon: FileText },
  { id: "inbox", label: "Inbox", Icon: Mail },
  { id: "reviews", label: "Reviews", Icon: Star },
  { id: "qa", label: "Q&A", Icon: Chat },
  { id: "audit", label: "Audit log", Icon: FileText },
  { id: "settings", label: "Settings", Icon: Settings },
];

function Gate({ children }: { children: ReactNode }) {
  return <div className="admin-gate"><div className="card">{children}</div></div>;
}

export default function AdminDashboard() {
  const { user, loading, configured, isAdmin, adminChecked, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Active tab lives in the URL (?tab=) so refresh, deep-link and Back all work.
  const rawTab = searchParams.get("tab");
  const tab: Tab = TABS.some((t) => t.id === rawTab) ? (rawTab as Tab) : "overview";
  // push (not replace) so Back steps through visited tabs.
  const setTab = (id: Tab) => { if (id !== tab) router.push(`/admin?tab=${id}`, { scroll: false }); };
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    if (!loading && configured && !user) router.replace("/login?next=/admin");
  }, [loading, configured, user, router]);

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }));
  }, []);

  if (!configured) {
    return <Gate><h1>Admin</h1><div className="msg info">{BACKEND_OFFLINE_ADMIN}</div><Link className="btn btn-line btn-block" href="/">Back to home</Link></Gate>;
  }
  if (loading || !user || !adminChecked) {
    return <div className="admin-gate"><span style={{ color: "var(--muted)" }}>Loading…</span></div>;
  }
  if (!isAdmin) {
    return (
      <Gate>
        <h1>Not authorized</h1>
        <p className="sub">Your account isn&apos;t an admin.</p>
        <div className="msg info"><code style={{ fontSize: 12 }}>insert into admins (user_id) select id from auth.users where email = &apos;{user.email}&apos;;</code></div>
        <Link className="btn btn-line btn-block" href="/account">Go to account</Link>
      </Gate>
    );
  }

  const current = TABS.find((t) => t.id === tab)!;

  return (
    <div className="admin-app">
      <aside className="admin-nav">
        <div className="admin-brand">
          <span className="mark" role="img" aria-label="L&T" />
          <div style={{ minWidth: 0 }}><b>Admin console</b><span>L&amp;T Restaurant Equipment</span></div>
        </div>
        <nav className="admin-nav-list" aria-label="Admin sections">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} className={tab === id ? "on" : ""} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>
              <Icon /> <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-nav-foot">
          <Link className="admin-foot-link" href="/">View store ↗</Link>
          <div className="admin-userbar">
            <span className="admin-ava">{(user.email?.[0] || "A").toUpperCase()}</span>
            <div className="admin-userbar-id"><b>{user.email}</b><span>Administrator</span></div>
            <button className="admin-signout-btn" onClick={() => { signOut(); router.push("/"); }} aria-label="Sign out"><LogOut /></button>
          </div>
        </div>
      </aside>

      <div className="admin-body">
        <header className="admin-topbar">
          <h1>{current.label}</h1>
          <span className="admin-date">{dateStr}</span>
        </header>
        <div className="admin-content">
          {tab === "overview" && <AdminAnalytics go={setTab} />}
          {tab === "catalog" && <AdminCatalog />}
          {tab === "orders" && <AdminOrders />}
          {tab === "customers" && <AdminCustomers />}
          {tab === "service" && <AdminService />}
          {tab === "quotes" && <AdminQuotes />}
          {tab === "inbox" && <AdminInbox />}
          {tab === "reviews" && <AdminReviews />}
          {tab === "qa" && <AdminQA />}
          {tab === "audit" && <AdminAudit />}
          {tab === "settings" && <AdminSettings />}
        </div>
      </div>
    </div>
  );
}
