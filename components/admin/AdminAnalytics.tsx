"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { money } from "@/lib/format";
import { BarChart, Donut, HBars, ChartCard } from "./Charts";

type Tab = "catalog" | "orders" | "customers" | "service" | "inbox";

type Data = {
  revenue: number; orders: number; products: number; inStock: number; customers: number;
  dealers: number; pendingDealers: number; openClaims: number; openTickets: number;
  revTrend: { label: string; value: number }[];
  orderStatus: { label: string; value: number; color: string }[];
  categories: { label: string; value: number }[];
  stock: { label: string; value: number; color: string }[];
  recentOrders: { created_at: string; status: string; total: number }[];
};

export default function AdminAnalytics({ go }: { go: (t: Tab) => void }) {
  const [d, setD] = useState<Data | null>(null);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    (async () => {
      const [prodRes, catRes, orderRes, claimRes, ticketRes, custRes] = await Promise.all([
        sb.from("products").select("category_id, price, stock"),
        sb.from("categories").select("id, name"),
        sb.from("orders").select("total, status, created_at").order("created_at", { ascending: false }),
        sb.from("warranty_claims").select("status"),
        sb.from("service_tickets").select("status"),
        fetch("/api/admin/customers").then((r) => (r.ok ? r.json() : { customers: [] })).catch(() => ({ customers: [] })),
      ]);
      const products = prodRes.data ?? [];
      const cats = catRes.data ?? [];
      const orders = (orderRes.data ?? []) as { total: number; status: string; created_at: string }[];
      const customers = (custRes.customers ?? []) as { role: string; dealerStatus: string | null }[];

      // revenue trend — last 14 days, keyed by LOCAL calendar date so the axis
      // labels, bucketing, and Revenue KPI all agree regardless of timezone.
      const DAYS = 14;
      const today = new Date();
      const localKey = (x: Date) =>
        `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
      const buckets = Array.from({ length: DAYS }, (_, i) => {
        const dt = new Date(today);
        dt.setDate(today.getDate() - (DAYS - 1 - i));
        return { key: localKey(dt), label: String(dt.getDate()), value: 0 };
      });
      orders.forEach((o) => {
        if (!o.created_at) return;
        const b = buckets.find((x) => x.key === localKey(new Date(o.created_at)));
        if (b) b.value += Number(o.total || 0);
      });

      const sc: Record<string, number> = {};
      orders.forEach((o) => { sc[o.status] = (sc[o.status] || 0) + 1; });

      const catCount: Record<string, number> = {};
      products.forEach((p) => { if (p.category_id) catCount[p.category_id] = (catCount[p.category_id] || 0) + 1; });

      const inStock = products.filter((p) => p.stock === "in").length;

      setD({
        revenue: orders.reduce((a, o) => a + Number(o.total || 0), 0),
        orders: orders.length,
        products: products.length,
        inStock,
        customers: customers.length,
        dealers: customers.filter((c) => c.role === "dealer" && c.dealerStatus === "approved").length,
        pendingDealers: customers.filter((c) => c.dealerStatus === "pending").length,
        openClaims: (claimRes.data ?? []).filter((c: { status: string }) => !["resolved", "rejected"].includes(c.status)).length,
        openTickets: (ticketRes.data ?? []).filter((t: { status: string }) => !["resolved", "closed"].includes(t.status)).length,
        revTrend: buckets.map(({ label, value }) => ({ label, value })),
        orderStatus: [
          { label: "Submitted", value: sc.submitted || 0, color: "#BA7517" },
          { label: "Processing", value: sc.processing || 0, color: "#378ADD" },
          { label: "Shipped", value: sc.shipped || 0, color: "#185FA5" },
          { label: "Delivered", value: sc.delivered || 0, color: "#3B6D11" },
          { label: "Cancelled", value: sc.cancelled || 0, color: "#888780" },
        ],
        categories: cats.map((c) => ({ label: c.name, value: catCount[c.id] || 0 })).filter((c) => c.value > 0).sort((a, b) => b.value - a.value),
        stock: [
          { label: "In stock", value: inStock, color: "#17191C" },
          { label: "Backorder", value: products.length - inStock, color: "#BE1E2D" },
        ],
        recentOrders: orders.slice(0, 6),
      });
    })();
  }, []);

  if (!d) return <div className="skel skel-row" />;

  const kpis: { label: string; value: string; sub?: string; hot?: boolean; tab?: Tab }[] = [
    { label: "Revenue", value: money(d.revenue), sub: `${d.orders} orders` },
    { label: "Orders", value: String(d.orders), tab: "orders" },
    { label: "Customers", value: String(d.customers), sub: `${d.dealers} dealers`, tab: "customers" },
    { label: "Products", value: String(d.products), sub: `${d.inStock} in stock`, tab: "catalog" },
    { label: "Open service", value: String(d.openClaims + d.openTickets), sub: `${d.openClaims} claims · ${d.openTickets} tickets`, hot: d.openClaims + d.openTickets > 0, tab: "service" },
    { label: "Trade requests", value: String(d.pendingDealers), sub: "pending review", hot: d.pendingDealers > 0, tab: "customers" },
  ];

  return (
    <>
      <div className="kpi-grid">
        {kpis.map((k) => (
          <button key={k.label} className={`kpi${k.hot ? " hot" : ""}${k.tab ? " link" : ""}`} onClick={() => k.tab && go(k.tab)} disabled={!k.tab}>
            <span className="kpi-l">{k.label}</span>
            <span className="kpi-v">{k.value}</span>
            {k.sub && <span className="kpi-s">{k.sub}</span>}
          </button>
        ))}
      </div>

      <div className="chart-grid">
        <ChartCard title="Revenue · last 14 days">
          <BarChart data={d.revTrend} format={money} />
        </ChartCard>
        <ChartCard title="Orders by status">
          <Donut segments={d.orderStatus} centerValue={String(d.orders)} centerLabel="orders" />
        </ChartCard>
        <ChartCard title="Catalog by category">
          <HBars data={d.categories} />
        </ChartCard>
        <ChartCard title="Inventory">
          <Donut segments={d.stock} centerValue={String(d.products)} centerLabel="SKUs" />
        </ChartCard>
      </div>

      <div className="admin-sec-head" style={{ marginTop: "var(--s5)" }}><h2 className="admin-h">Recent orders</h2></div>
      {d.recentOrders.length === 0 ? (
        <p className="admin-sub">No orders yet — they&apos;ll appear here as customers check out.</p>
      ) : (
        <div className="sub-list">
          {d.recentOrders.map((o, i) => (
            <div className="sub-row" key={i}>
              <span>{new Date(o.created_at).toLocaleDateString()} <span className={`pill ${["delivered", "shipped"].includes(o.status) ? "ok" : o.status === "cancelled" ? "mut" : "warn"}`}>{o.status}</span></span>
              <span style={{ fontWeight: 700 }}>{money(Number(o.total))}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
