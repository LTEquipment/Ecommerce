"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { money } from "@/lib/format";
import {
  ChartCard, Donut, HBars, BarChart,
  DualTrend, StackedHBars, DataTable, KpiDelta, Sparkline,
  type Delta,
} from "./Charts";

type Tab = "catalog" | "orders" | "customers" | "service" | "inbox";
type Range = "7d" | "30d" | "90d" | "All";

const SC: Record<string, string> = {
  submitted: "#BA7517", processing: "#378ADD", shipped: "#185FA5", delivered: "#3B6D11", cancelled: "#888780",
};

const pad = (n: number) => String(n).padStart(2, "0");
const md = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
function daysAgoLocal(iso: string): number {
  const d = new Date(iso); if (isNaN(d.getTime())) return 1e9;
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const t = new Date(); const b = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
const pctS = (x: number) => `${Math.round(x * 100)}%`;

type Raw = {
  products: any[]; categories: any[]; orders: any[]; items: any[];
  claims: any[]; tickets: any[]; subs: any[]; contacts: any[]; customers: any[];
};

function DeltaBadge({ delta, neutral }: { delta: Delta; neutral?: boolean }) {
  if (delta.state === "none") return null;
  const txt = delta.state === "new" ? "NEW" : delta.state === "flat" ? "±0%"
    : `${delta.state === "up" ? "▲" : "▼"} ${Math.abs(delta.pct ?? 0).toFixed(Math.abs(delta.pct ?? 0) < 10 ? 1 : 0)}%`;
  return <span className={`kpi-delta ${neutral ? "neutral" : delta.state}`}>{txt}</span>;
}

export default function AdminAnalytics({ go }: { go: (t: Tab) => void }) {
  const [raw, setRaw] = useState<Raw | null>(null);
  const [range, setRange] = useState<Range>("30d");

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    (async () => {
      const [p, c, o, i, w, t, s, m, cust] = await Promise.all([
        sb.from("products").select("*"),
        sb.from("categories").select("id,name"),
        sb.from("orders").select("*").order("created_at", { ascending: false }),
        sb.from("order_items").select("order_id,sku,name,unit_price,qty"),
        sb.from("warranty_claims").select("id,created_at,model,sku,status"),
        sb.from("service_tickets").select("id,created_at,subject,status"),
        sb.from("subscribers").select("created_at"),
        sb.from("contact_messages").select("created_at"),
        fetch("/api/admin/customers").then((r) => (r.ok ? r.json() : { customers: [] })).catch(() => ({ customers: [] })),
      ]);
      setRaw({
        products: p.data ?? [], categories: c.data ?? [], orders: o.data ?? [], items: i.data ?? [],
        claims: w.data ?? [], tickets: t.data ?? [], subs: s.data ?? [], contacts: m.data ?? [],
        customers: cust.customers ?? [],
      });
    })();
  }, []);

  const d = useMemo(() => (raw ? compute(raw, range) : null), [raw, range]);

  if (!d) return (
    <div className="an-skel">
      <div className="kpi-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skel an-skel-kpi" />)}</div>
      <div className="an-skel-charts">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="skel an-skel-chart" />)}</div>
    </div>
  );

  const snap = <span className="an-snap" title="Reflects current state — ignores the date range">now</span>;

  return (
    <>
      {/* time range */}
      <div className="an-range" role="tablist" aria-label="Time range">
        {(["7d", "30d", "90d", "All"] as Range[]).map((r) => (
          <button key={r} role="tab" aria-selected={range === r} className={range === r ? "on" : ""} onClick={() => setRange(r)}>
            {r === "All" ? "All time" : `Last ${r.replace("d", "")} days`}
          </button>
        ))}
        <span className="an-range-note">{range === "All" ? "All-time totals · period deltas off" : `vs previous ${range.replace("d", "")} days`}</span>
      </div>

      {/* KPI strip */}
      <div className="kpi-grid">
        <KpiDelta label="Revenue" value={money(d.curRev)} delta={d.revDelta} sub={`${d.curOrd} orders`} />
        <KpiDelta label="Orders" value={String(d.curOrd)} delta={d.ordDelta} sub={`${d.acctCur} account · ${d.guestCur} guest`} onClick={() => go("orders")} />
        <KpiDelta label="Avg order value" value={d.curOrd > 0 ? money(d.aovCur) : "—"} delta={d.aovDelta} sub={d.curOrd > 0 ? `${money(d.curSub / d.curOrd)} goods` : "Awaiting orders"} />
        <KpiDelta label="Units sold" value={String(d.curUnits)} delta={d.unitDelta} sub={`${d.skusSold} SKUs sold`} onClick={() => go("catalog")} />
        <KpiDelta label="New customers" value={String(d.curSignups)} delta={d.signDelta} sub={`${d.curSubs} subscribers`} onClick={() => go("customers")} />
        <KpiDelta label="Fulfillment rate" value={d.actCur > 0 ? pctS(d.rateCur) : "—"} delta={d.rateDelta} sub={`${d.fulCur}/${d.actCur} shipped+delivered`} onClick={() => go("orders")} />
        <KpiDelta label="Backlog to ship" value={money(d.backlog)} hot={d.backlog > 0} sub={`${d.nSub} new · ${d.nProc} in progress`} onClick={() => go("orders")} />
        <KpiDelta label="Trade & service load" value={String(d.pendingDealers + d.openClaims + d.openTickets)} hot={d.pendingDealers + d.openClaims + d.openTickets > 0} sub={`${d.pendingDealers} trade · ${d.openClaims} claims · ${d.openTickets} tickets`} onClick={() => go("service")} />
      </div>

      {/* Revenue & orders */}
      <SecHead title="Revenue & orders" />
      <div className="chart-grid">
        <ChartCard title={`Revenue: current vs previous`}>
          <DualTrend seriesA={d.revA} seriesB={d.revB} labels={d.labels} format={money} aLabel="This period" bLabel="Previous" colorA="#185FA5" />
        </ChartCard>
        <ChartCard title="Order volume: current vs previous">
          <DualTrend seriesA={d.ordA} seriesB={d.ordB} labels={d.labels} aLabel="This period" bLabel="Previous" colorA="#3B6D11" />
        </ChartCard>
        <ChartCard title="Cumulative revenue pace">
          <DualTrend seriesA={d.cumA} seriesB={d.cumB} labels={d.labels} format={money} aLabel="This period" bLabel="Previous" colorA="#BE1E2D" />
        </ChartCard>
        <ChartCard title="Revenue by fulfillment stage" action={snap}>
          <Donut segments={d.stageSeg} centerValue={money(d.bookedTotal)} centerLabel="booked" />
        </ChartCard>
      </div>

      {/* Products & categories */}
      <SecHead title="Products & categories" />
      <div className="chart-grid">
        <ChartCard title="Revenue by category">
          {d.catRevData.length ? <HBars data={d.catRevData} format={money} /> : <div className="chart-empty">No sales in this range yet</div>}
        </ChartCard>
        <ChartCard title="Sale vs full-price revenue">
          {d.discRev + d.fullRev > 0
            ? <><StackedHBars segments={[{ label: "Discounted", value: d.discRev, color: "#BA7517" }, { label: "Full price", value: d.fullRev, color: "#3B6D11" }]} format={money} />
              <p className="an-substat">{money(d.markdown)} given away in markdowns</p></>
            : <div className="chart-empty">No sales in this range yet</div>}
        </ChartCard>
      </div>
      <ChartCard title={`Top products · ${range === "All" ? "all time" : "this period"}`}>
        <DataTable
          emptyText="No products sold yet — top sellers appear after the first order"
          initialSort={{ key: "revenue", dir: "desc" }}
          columns={[
            { key: "name", label: "Product", render: (r: any) => <span className="dt-name">{r.name}<em>{r.sku}</em></span> },
            { key: "units", label: "Units", align: "right", sortable: true },
            { key: "orders", label: "Orders", align: "right", sortable: true },
            { key: "revenue", label: "Revenue", align: "right", sortable: true, format: (v: any) => money(v) },
            { key: "share", label: "Share", align: "right", render: (r: any) => <span className="dt-share"><i style={{ width: `${Math.min(100, r.share * 100)}%` }} />{pctS(r.share)}</span> },
          ]}
          rows={d.topProducts}
        />
      </ChartCard>
      <ChartCard title="Dead stock — never sold" action={snap}>
        <DataTable
          emptyText={d.items0 ? "No orders yet — sell-through is undefined" : "Every catalog SKU has sold at least once"}
          columns={[
            { key: "name", label: "Product", render: (r: any) => <span className="dt-name">{r.name}<em>{r.sku}</em></span> },
            { key: "stockQty", label: "On hand", align: "right", render: (r: any) => (d.invEnabled ? r.stockQty : "—") },
            { key: "tiedValue", label: d.invEnabled ? "Tied-up value" : "Unit price", align: "right", format: (v: any) => money(v) },
          ]}
          rows={d.dead}
        />
        {d.dead.length > 0 && <p className="an-substat">{d.dead.length} SKUs never sold · {money(d.deadTied)} {d.invEnabled ? "tied up" : "list value"}</p>}
      </ChartCard>

      {/* Customers & trade */}
      <SecHead title="Customers & trade" />
      <div className="chart-grid">
        <ChartCard title="New accounts & subscribers / week">
          <DualTrend seriesA={d.accW} seriesB={d.subW} labels={d.wlabels} aLabel="Accounts" bLabel="Subscribers" colorA="#185FA5" colorB="#BA7517" emptyText="No signups in the last 12 weeks" />
        </ChartCard>
        <ChartCard title="Dealer vs Retail revenue" action={snap}>
          <Donut segments={[{ label: "Dealer", value: d.dealerRev, color: "#185FA5" }, { label: "Retail", value: d.retailRev, color: "#17191C" }]} centerValue={money(d.dealerRev + d.retailRev)} centerLabel="revenue" />
        </ChartCard>
        <ChartCard title="Channel scorecard" action={snap}>
          <table className="scorecard">
            <thead><tr><th /><th>Dealer</th><th>Retail</th></tr></thead>
            <tbody>
              <tr><td>Orders</td><td>{d.dealerOrd}</td><td>{d.retailOrd}</td></tr>
              <tr><td>Revenue</td><td>{money(d.dealerRev)}</td><td>{money(d.retailRev)}</td></tr>
              <tr><td>Avg order</td><td>{d.dealerOrd ? money(d.dealerRev / d.dealerOrd) : "—"}</td><td>{d.retailOrd ? money(d.retailRev / d.retailOrd) : "—"}</td></tr>
            </tbody>
          </table>
          <p className="an-substat">Revenue / active dealer: <b>{d.revPerDealer != null ? money(d.revPerDealer) : "— (no approved dealers yet)"}</b></p>
        </ChartCard>
        <ChartCard title="Trade-account pipeline" action={snap}>
          {d.pApp + d.aApp + d.rApp > 0 ? (
            <>
              <StackedHBars segments={[{ label: "Pending", value: d.pApp, color: "#BA7517" }, { label: "Approved", value: d.aApp, color: "#3B6D11" }, { label: "Rejected", value: d.rApp, color: "#888780" }]} />
              <p className="an-substat">{d.approvalRate != null ? `${pctS(d.approvalRate)} approved of decided` : "No decided applications yet"} · {d.pApp} pending review</p>
            </>
          ) : <div className="chart-empty">No trade applications yet</div>}
        </ChartCard>
        <ChartCard title="Top accounts by revenue" action={snap}>
          {d.topAccounts.length ? <HBars data={d.topAccounts} format={money} /> : <div className="chart-empty">No signed-in account orders yet — checkouts so far are guest/retail</div>}
        </ChartCard>
        <ChartCard title="Account activation & recency" action={snap}>
          <HBars data={d.recency} />
          <p className="an-substat">{pctS(d.confirmedPct)} of accounts have confirmed email</p>
        </ChartCard>
      </div>

      {/* Fulfillment & service */}
      <SecHead title="Fulfillment & service" />
      <div className="chart-grid">
        <ChartCard title="Order fulfillment funnel" action={snap}>
          <HBars data={d.funnel} />
          {d.cancelledCount > 0 && <p className="an-substat">{d.cancelledCount} cancelled ({pctS(d.cancelPctAll)} of all orders)</p>}
        </ChartCard>
        <ChartCard title="Cancellation & freight ratios">
          <div className="an-stat-pair">
            <div>
              <span className="ps-l">Cancellation rate</span>
              <span className="ps-v">{d.allCur > 0 ? (d.allCur < 10 ? `${d.cancCur} of ${d.allCur}` : pctS(d.cancRateCur)) : "—"}<DeltaBadge delta={d.cancDelta} neutral /></span>
              <span className="ps-s">{d.cancCur} cancelled this period</span>
            </div>
            <div>
              <span className="ps-l">Freight % of revenue</span>
              <span className="ps-v">{d.curSub > 0 ? pctS(d.freightPctCur) : "—"}<DeltaBadge delta={d.freightDelta} neutral /></span>
              <span className="ps-s">{money(d.curFr)} freight collected</span>
            </div>
          </div>
        </ChartCard>
        <ChartCard title="Warranty claims & approval" action={snap}>
          {d.claimTotal > 0 ? (
            <>
              <HBars data={d.claimData} />
              <p className="an-substat">{d.claimApproval != null ? `${pctS(d.claimApproval)} approved of decided` : "No decided claims"} · {d.claimBacklog} open</p>
            </>
          ) : <div className="chart-empty">No warranty claims yet</div>}
        </ChartCard>
        <ChartCard title="Service tickets: open vs resolved" action={snap}>
          {d.tOpen + d.tDone > 0
            ? <><StackedHBars segments={[{ label: "Open", value: d.tOpen, color: "#BA7517" }, { label: "Resolved", value: d.tDone, color: "#3B6D11" }]} />
              <p className="an-substat">{d.tInProg} in progress</p></>
            : <div className="chart-empty">No service tickets yet</div>}
        </ChartCard>
        <ChartCard title="Oldest open service items" action={snap}>
          <DataTable
            emptyText="All service items closed — nothing aging"
            columns={[
              { key: "type", label: "Type" },
              { key: "label", label: "Item", render: (r: any) => <span className="dt-name">{r.label}</span> },
              { key: "status", label: "Status", render: (r: any) => <span className="pill info">{String(r.status).replace(/_/g, " ")}</span> },
              { key: "ageDays", label: "Age", align: "right", format: (v: any) => `${v}d` },
            ]}
            rows={d.aging}
            maxRows={8}
          />
        </ChartCard>
        <ChartCard title="Service intake · last 30 days">
          <Sparkline series={d.intake} height={60} emptyText="No service activity in the last 30 days" />
          <p className="an-substat">{d.intake.reduce((a: number, b: number) => a + b, 0)} new tickets + claims · last 30 days</p>
        </ChartCard>
      </div>

      {/* Inventory & catalog health */}
      <SecHead title="Inventory & catalog health" />
      <div className="kpi-grid">
        <KpiDelta label="Inventory value" value={d.invEnabled ? money(d.invValue) : "—"} sub={d.invEnabled ? `${d.invUnits} units · ${d.skusStocked} SKUs` : "Run stock_qty migration"} />
        <KpiDelta label="Backorder exposure" value={String(d.backCount)} hot={d.backCount > 0} sub={`${money(d.backRetail)} retail unavailable`} />
        <KpiDelta label="Lost demand (backordered)" value={money(d.lostDemand)} sub="already ordered while out" />
        <KpiDelta label="Review coverage" value={pctS(d.coverage)} sub={`${d.zeroReview} SKUs with none`} />
      </div>
      <div className="chart-grid">
        {d.invEnabled ? (
          <>
            <ChartCard title="On-hand value by category" action={snap}>
              {d.catValData.length ? <HBars data={d.catValData} format={money} /> : <div className="chart-empty">No stocked inventory to value</div>}
            </ChartCard>
            <ChartCard title="Top SKUs by on-hand value" action={snap}>
              {d.topSku.length ? <HBars data={d.topSku} format={money} /> : <div className="chart-empty">No stocked SKUs</div>}
            </ChartCard>
            <ChartCard title="Stock health by category" action={snap}>
              {d.healthRows.length ? <StackedHBars rows={d.healthRows} /> : <div className="chart-empty">No categorized stock</div>}
            </ChartCard>
          </>
        ) : (
          <ChartCard title="Inventory value">
            <div className="chart-empty">Run <code>supabase/admin-catalog.sql</code> to track stock quantities and value inventory.</div>
          </ChartCard>
        )}
        <ChartCard title="Catalog by brand" action={snap}>
          <HBars data={d.brandData} />
        </ChartCard>
        <ChartCard title="Price band distribution" action={snap}>
          <BarChart data={d.priceBands} />
        </ChartCard>
        <ChartCard title="Merchandising: badges" action={snap}>
          <Donut segments={d.badgeSeg} centerValue={String(d.products)} centerLabel="SKUs" />
          <p className="an-substat">{d.onSale} on sale · avg {pctS(d.avgDisc)} off</p>
        </ChartCard>
      </div>
      <ChartCard title="Review coverage — most reviewed" action={snap}>
        <DataTable
          emptyText="No reviews collected yet"
          columns={[
            { key: "name", label: "Product", render: (r: any) => <span className="dt-name">{r.name}</span> },
            { key: "rating", label: "Rating", align: "right", format: (v: any) => `★ ${Number(v).toFixed(1)}` },
            { key: "reviews", label: "Reviews", align: "right", sortable: true },
          ]}
          rows={d.bestReviewed}
          maxRows={6}
        />
      </ChartCard>

      {/* Payments */}
      <SecHead title="Payments" />
      {!d.payEnabled ? (
        <div className="emptybox"><div className="m">Payments not tracked yet</div><div className="s">Run <code>supabase/payments.sql</code> to record payment method &amp; status on orders, then payment analytics light up here.</div></div>
      ) : (
        <>
          <div className="kpi-grid">
            <KpiDelta label="Collected" value={money(d.collected)} sub={`${pctS(d.collectionRate)} of booked revenue`} />
            <KpiDelta label="Outstanding" value={money(d.outstanding)} hot={d.outstanding > 0} sub="pending collection" />
            <KpiDelta label="Refunded" value={money(d.refunded)} sub={`${d.statusCount.refunded || 0} orders`} />
            <KpiDelta label="Failed / declined" value={money(d.failed)} hot={(d.statusCount.failed || 0) > 0} sub={`${d.statusCount.failed || 0} orders`} />
          </div>
          <div className="chart-grid">
            <ChartCard title="Orders by payment status" action={snap}>
              <Donut segments={d.paySeg} centerValue={String(d.orders)} centerLabel="orders" />
            </ChartCard>
            <ChartCard title="Collected revenue by method" action={snap}>
              {d.methodData.length ? <HBars data={d.methodData} format={money} /> : <div className="chart-empty">No collected payments yet</div>}
            </ChartCard>
          </div>
        </>
      )}
    </>
  );
}

function SecHead({ title }: { title: string }) {
  return <div className="an-sec-head"><h2 className="an-sec-h">{title}</h2></div>;
}

// ------------------------------------------------------------
// All derivations — pure, from the loaded data + selected range.
// ------------------------------------------------------------
function compute(raw: Raw, range: Range) {
  const N = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : null;
  const inCur = (da: number) => (N === null ? da >= 0 : da >= 0 && da < N);
  const inPrev = (da: number) => (N === null ? false : da >= N && da < 2 * N);
  const mkDelta = (cur: number, prev: number): Delta => {
    if (N === null) return { pct: null, state: "none" };
    if (prev <= 0) return cur > 0 ? { pct: null, state: "new" } : { pct: null, state: "none" };
    const p = ((cur - prev) / prev) * 100;
    return { pct: p, state: Math.abs(p) < 0.5 ? "flat" : p > 0 ? "up" : "down" };
  };

  // trend buckets
  const bmode: "day" | "week" = N === 7 || N === 30 ? "day" : "week";
  const bcount = N === 7 ? 7 : N === 30 ? 30 : N === 90 ? 13 : 12;
  const per = bmode === "week" ? 7 : 1;
  const today = new Date();
  const labels: string[] = [];
  for (let b = 0; b < bcount; b++) {
    const dt = new Date(today); dt.setDate(today.getDate() - (bcount - 1 - b) * per); labels.push(md(dt));
  }
  // Gate buckets on the exact KPI windows so weekly buckets (90d/All) tile
  // [0,N)/[N,2N) identically to inCur/inPrev — otherwise the trend and the
  // delta badge above it describe different periods at the boundary.
  const bIdx = (da: number, which: "cur" | "prev") => {
    if (which === "cur") { if (!inCur(da)) return -1; const i = bcount - 1 - Math.floor(da / per); return i >= 0 ? i : -1; }
    if (!inPrev(da)) return -1; const i = bcount - 1 - Math.floor((da - (N as number)) / per); return i >= 0 ? i : -1;
  };

  const invEnabled = raw.products.length > 0 && "stock_qty" in raw.products[0];
  const payEnabled = raw.orders.length > 0 && "payment_status" in raw.orders[0];

  const orders = raw.orders.map((o: any) => ({
    ...o, _da: daysAgoLocal(o.created_at), _t: Number(o.total || 0), _sub: Number(o.subtotal || 0),
    _fr: Number(o.freight || 0), _cancel: o.status === "cancelled",
  }));
  const orderById = new Map(orders.map((o: any) => [o.id, o]));
  const custs = raw.customers.filter((c: any) => !c.isAdmin);
  const custMap = new Map(raw.customers.map((c: any) => [c.id, c]));
  const isDealer = (cid: any) => { const c = custMap.get(cid); return !!(c && c.role === "dealer" && c.dealerStatus === "approved"); };
  const catName: Record<string, string> = Object.fromEntries(raw.categories.map((c: any) => [c.id, c.name]));
  const skuToCat = new Map(raw.products.map((p: any) => [p.sku, p.category_id]));
  const prodBySku = new Map(raw.products.map((p: any) => [p.sku, p]));

  // KPIs — revenue / orders / basket
  let curRev = 0, prevRev = 0, curOrd = 0, prevOrd = 0, curSub = 0, curFr = 0, prevSub = 0, prevFr = 0, guestCur = 0, acctCur = 0;
  orders.forEach((o: any) => {
    if (o._cancel) return;
    if (inCur(o._da)) { curRev += o._t; curOrd++; curSub += o._sub; curFr += o._fr; if (o.customer_id) acctCur++; else guestCur++; }
    else if (inPrev(o._da)) { prevRev += o._t; prevOrd++; prevSub += o._sub; prevFr += o._fr; }
  });
  const aovCur = curOrd > 0 ? curRev / curOrd : 0, aovPrev = prevOrd > 0 ? prevRev / prevOrd : 0;

  // units
  let curUnits = 0, prevUnits = 0; const skusSoldSet = new Set<string>();
  raw.items.forEach((it: any) => {
    const o = orderById.get(it.order_id); if (!o || o._cancel) return; const q = Number(it.qty || 0);
    if (inCur(o._da)) { curUnits += q; if (it.sku) skusSoldSet.add(it.sku); } else if (inPrev(o._da)) prevUnits += q;
  });

  // signups + subscribers
  let curSignups = 0, prevSignups = 0, curSubs = 0;
  custs.forEach((c: any) => { const da = daysAgoLocal(c.createdAt); if (inCur(da)) curSignups++; else if (inPrev(da)) prevSignups++; });
  raw.subs.forEach((s: any) => { if (inCur(daysAgoLocal(s.created_at))) curSubs++; });

  // fulfillment rate + cancellation window
  let actCur = 0, fulCur = 0, actPrev = 0, fulPrev = 0, cancCur = 0, cancPrev = 0, allCur = 0, allPrev = 0;
  orders.forEach((o: any) => {
    const f = o.status === "shipped" || o.status === "delivered";
    if (inCur(o._da)) { allCur++; if (o._cancel) cancCur++; else actCur++; if (f) fulCur++; }
    else if (inPrev(o._da)) { allPrev++; if (o._cancel) cancPrev++; else actPrev++; if (f) fulPrev++; }
  });
  const rateCur = actCur > 0 ? fulCur / actCur : 0, ratePrev = actPrev > 0 ? fulPrev / actPrev : 0;
  const cancRateCur = allCur > 0 ? cancCur / allCur : 0, cancRatePrev = allPrev > 0 ? cancPrev / allPrev : 0;
  const freightPctCur = curSub > 0 ? curFr / curSub : 0, freightPctPrev = prevSub > 0 ? prevFr / prevSub : 0;

  // snapshots
  let backlog = 0, nSub = 0, nProc = 0;
  raw.orders.forEach((o: any) => {
    if (o.status === "submitted") { backlog += Number(o.total || 0); nSub++; }
    else if (o.status === "processing") { backlog += Number(o.total || 0); nProc++; }
  });
  const pendingDealers = custs.filter((c: any) => c.dealerStatus === "pending").length;
  const openClaims = raw.claims.filter((c: any) => ["submitted", "in_review"].includes(c.status)).length;
  const openTickets = raw.tickets.filter((t: any) => ["open", "in_progress"].includes(t.status)).length;

  // trends
  const revA = new Array(bcount).fill(0), revB = new Array(bcount).fill(0), ordA = new Array(bcount).fill(0), ordB = new Array(bcount).fill(0);
  orders.forEach((o: any) => {
    if (o._cancel) return; const ic = bIdx(o._da, "cur"), ip = bIdx(o._da, "prev");
    if (ic >= 0) { revA[ic] += o._t; ordA[ic]++; } if (ip >= 0) { revB[ip] += o._t; ordB[ip]++; }
  });
  const cum = (s: number[]) => { const out: number[] = []; s.reduce((acc, v) => { const n2 = acc + v; out.push(n2); return n2; }, 0); return out; };
  const cumA = cum(revA), cumB = cum(revB);

  const revByStatus: Record<string, number> = {};
  raw.orders.forEach((o: any) => { revByStatus[o.status] = (revByStatus[o.status] || 0) + Number(o.total || 0); });
  // Exclude Cancelled so the ring total matches the "booked" center value.
  const stageSeg = [["submitted", "Submitted"], ["processing", "Processing"], ["shipped", "Shipped"], ["delivered", "Delivered"]]
    .map(([k, l]) => ({ label: l, value: revByStatus[k] || 0, color: SC[k] }));
  const bookedTotal = orders.filter((o: any) => !o._cancel).reduce((a: number, o: any) => a + o._t, 0);

  // products & categories (current window sales)
  const catRev: Record<string, number> = {};
  const prodAgg: Record<string, { name: string; sku: string; revenue: number; units: number; orders: Set<string> }> = {};
  let discRev = 0, fullRev = 0, markdown = 0;
  raw.items.forEach((it: any) => {
    const o = orderById.get(it.order_id); if (!o || o._cancel || !inCur(o._da)) return;
    const rev = Number(it.unit_price || 0) * Number(it.qty || 0);
    const cat = skuToCat.get(it.sku) ?? "__uncat"; catRev[cat] = (catRev[cat] || 0) + rev;
    const key = it.sku || it.name;
    if (!prodAgg[key]) prodAgg[key] = { name: prodBySku.get(it.sku)?.name || it.name, sku: it.sku || "—", revenue: 0, units: 0, orders: new Set() };
    const a = prodAgg[key]; a.revenue += rev; a.units += Number(it.qty || 0); a.orders.add(it.order_id);
    const p = prodBySku.get(it.sku);
    const isDisc = p && ((p.was_price && Number(p.was_price) > Number(it.unit_price)) || p.badge === "Sale");
    if (isDisc) { discRev += rev; if (p?.was_price && Number(p.was_price) > Number(it.unit_price)) markdown += (Number(p.was_price) - Number(it.unit_price)) * Number(it.qty || 0); } else fullRev += rev;
  });
  const catRevData = Object.entries(catRev).map(([id, v]) => ({ label: id === "__uncat" ? "Uncategorized" : (catName[id] || id), value: v })).sort((a, b) => b.value - a.value).slice(0, 8);
  const totRev = Object.values(prodAgg).reduce((s, a) => s + a.revenue, 0) || 1;
  const topProducts = Object.values(prodAgg).map((a) => ({ name: a.name, sku: a.sku, revenue: a.revenue, units: a.units, orders: a.orders.size, share: a.revenue / totRev })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  const soldAll = new Set(raw.items.map((i: any) => i.sku).filter(Boolean));
  // No order items → sell-through is undefined; keep dead empty so the honest
  // "No orders yet" message renders instead of flagging the whole catalog.
  const dead = raw.items.length === 0 ? [] : raw.products.filter((p: any) => p.sku && !soldAll.has(p.sku))
    .map((p: any) => ({ name: p.name, sku: p.sku, tiedValue: invEnabled ? Number(p.stock_qty || 0) * Number(p.price || 0) : Number(p.price || 0), stockQty: Number(p.stock_qty || 0) }))
    .sort((a, b) => b.tiedValue - a.tiedValue);
  const deadTied = dead.reduce((s, x) => s + x.tiedValue, 0);

  // customers & trade
  const WK = 12; const accW = new Array(WK).fill(0), subW = new Array(WK).fill(0); const wlabels: string[] = [];
  for (let b = 0; b < WK; b++) { const dt = new Date(today); dt.setDate(today.getDate() - (WK - 1 - b) * 7); wlabels.push(md(dt)); }
  custs.forEach((c: any) => { const u = Math.floor(daysAgoLocal(c.createdAt) / 7); if (u >= 0 && u < WK) accW[WK - 1 - u]++; });
  raw.subs.forEach((s: any) => { const u = Math.floor(daysAgoLocal(s.created_at) / 7); if (u >= 0 && u < WK) subW[WK - 1 - u]++; });

  let dealerRev = 0, retailRev = 0, dealerOrd = 0, retailOrd = 0;
  orders.forEach((o: any) => { if (o._cancel) return; if (isDealer(o.customer_id)) { dealerRev += o._t; dealerOrd++; } else { retailRev += o._t; retailOrd++; } });
  const approvedDealers = custs.filter((c: any) => c.role === "dealer" && c.dealerStatus === "approved").length;
  const revPerDealer = approvedDealers > 0 ? dealerRev / approvedDealers : null;

  const appPool = custs.filter((c: any) => c.dealerStatus);
  const pApp = appPool.filter((c: any) => c.dealerStatus === "pending").length;
  const aApp = appPool.filter((c: any) => c.dealerStatus === "approved").length;
  const rApp = appPool.filter((c: any) => c.dealerStatus === "rejected").length;
  const approvalRate = aApp + rApp > 0 ? aApp / (aApp + rApp) : null;

  const acctRev: Record<string, number> = {};
  orders.forEach((o: any) => { if (o._cancel || !o.customer_id) return; acctRev[o.customer_id] = (acctRev[o.customer_id] || 0) + o._t; });
  const topAccounts = Object.entries(acctRev).map(([id, v]) => { const c: any = custMap.get(id); return { label: c?.company || c?.email || ("Account " + id.slice(0, 6)), value: v, color: isDealer(id) ? "#185FA5" : "#17191C" }; }).sort((a, b) => b.value - a.value).slice(0, 8);

  const cohortDefs: [string, number, number, string][] = [["0–7d", 0, 7, "#3B6D11"], ["8–30d", 8, 30, "#185FA5"], ["31–90d", 31, 90, "#BA7517"], ["90d+", 91, 1e9, "#888780"]];
  const recency = cohortDefs.map(([label, lo, hi, color]) => ({ label, value: custs.filter((c: any) => c.lastSignInAt && daysAgoLocal(c.lastSignInAt) >= lo && daysAgoLocal(c.lastSignInAt) <= hi).length, color }));
  recency.push({ label: "Never", value: custs.filter((c: any) => !c.lastSignInAt).length, color: "#C9CDD2" });
  const confirmedPct = custs.length > 0 ? custs.filter((c: any) => c.confirmed).length / custs.length : 0;

  // fulfillment & service
  const cnt = (s: string) => raw.orders.filter((o: any) => o.status === s).length;
  const rDel = cnt("delivered"), rShip = cnt("shipped") + rDel, rProc = cnt("processing") + rShip, rSub = cnt("submitted") + rProc;
  const funnel = [{ label: "Submitted", value: rSub, color: "#BA7517" }, { label: "Processing", value: rProc, color: "#378ADD" }, { label: "Shipped", value: rShip, color: "#185FA5" }, { label: "Delivered", value: rDel, color: "#3B6D11" }];
  const cancelledCount = cnt("cancelled"); const totalOrders = raw.orders.length; const cancelPctAll = totalOrders > 0 ? cancelledCount / totalOrders : 0;

  const cw = (s: string) => raw.claims.filter((c: any) => c.status === s).length;
  const claimData = [["submitted", "Submitted", "#BA7517"], ["in_review", "In review", "#378ADD"], ["approved", "Approved", "#3B6D11"], ["resolved", "Resolved", "#185FA5"], ["rejected", "Rejected", "#888780"]].map(([k, l, c]) => ({ label: l, value: cw(k), color: c }));
  const claimTotal = raw.claims.length;
  const claimDecided = cw("approved") + cw("resolved") + cw("rejected");
  const claimApproval = claimDecided > 0 ? (cw("approved") + cw("resolved")) / claimDecided : null;
  const claimBacklog = cw("submitted") + cw("in_review");

  const tOpen = raw.tickets.filter((t: any) => ["open", "in_progress"].includes(t.status)).length;
  const tDone = raw.tickets.filter((t: any) => ["resolved", "closed"].includes(t.status)).length;
  const tInProg = raw.tickets.filter((t: any) => t.status === "in_progress").length;

  const aging = [
    ...raw.tickets.filter((t: any) => ["open", "in_progress"].includes(t.status)).map((t: any) => ({ type: "Ticket", label: t.subject || "Ticket", status: t.status, ageDays: daysAgoLocal(t.created_at) })),
    ...raw.claims.filter((c: any) => ["submitted", "in_review"].includes(c.status)).map((c: any) => ({ type: "Claim", label: c.model || c.sku || "Claim", status: c.status, ageDays: daysAgoLocal(c.created_at) })),
  ].sort((a, b) => b.ageDays - a.ageDays).slice(0, 8);

  const intake = new Array(30).fill(0);
  const addIntake = (iso: string) => { const da = daysAgoLocal(iso); if (da >= 0 && da < 30) intake[29 - da]++; };
  raw.tickets.forEach((t: any) => addIntake(t.created_at)); raw.claims.forEach((c: any) => addIntake(c.created_at));

  // inventory & catalog
  const invValue = invEnabled ? raw.products.reduce((s: number, p: any) => s + Number(p.stock_qty || 0) * Number(p.price || 0), 0) : 0;
  const invUnits = invEnabled ? raw.products.reduce((s: number, p: any) => s + Number(p.stock_qty || 0), 0) : 0;
  const skusStocked = invEnabled ? raw.products.filter((p: any) => Number(p.stock_qty || 0) > 0).length : 0;
  const backordered = raw.products.filter((p: any) => p.stock === "back" || (invEnabled && Number(p.stock_qty || 0) <= 0));
  const backCount = backordered.length; const backRetail = backordered.reduce((s: number, p: any) => s + Number(p.price || 0), 0);
  const backSkus = new Set(backordered.map((p: any) => p.sku));
  let lostDemand = 0; raw.items.forEach((it: any) => { if (backSkus.has(it.sku)) lostDemand += Number(it.unit_price || 0) * Number(it.qty || 0); });

  const catVal: Record<string, number> = {};
  if (invEnabled) raw.products.forEach((p: any) => { if (p.category_id) catVal[p.category_id] = (catVal[p.category_id] || 0) + Number(p.stock_qty || 0) * Number(p.price || 0); });
  const catValData = Object.entries(catVal).map(([id, v]) => ({ label: catName[id] || id, value: v })).filter((x) => x.value > 0).sort((a, b) => b.value - a.value);
  const topSku = invEnabled ? raw.products.map((p: any) => ({ label: p.name, value: Number(p.stock_qty || 0) * Number(p.price || 0) })).filter((x: any) => x.value > 0).sort((a: any, b: any) => b.value - a.value).slice(0, 10) : [];
  const healthRows = invEnabled ? raw.categories.map((c: any) => {
    const ps = raw.products.filter((p: any) => p.category_id === c.id); let healthy = 0, low = 0, out = 0;
    ps.forEach((p: any) => { const q = Number(p.stock_qty || 0); const lo = Number(p.low_stock ?? 5); if (q <= 0 || p.stock === "back") out++; else if (q <= lo) low++; else healthy++; });
    return { label: c.name, segments: [{ label: "Healthy", value: healthy, color: "#17191C" }, { label: "Low", value: low, color: "#BA7517" }, { label: "Out", value: out, color: "#BE1E2D" }], _bad: low + out };
  }).filter((r: any) => r.segments.some((s: any) => s.value > 0)).sort((a: any, b: any) => b._bad - a._bad) : [];

  const brandCount: Record<string, number> = {};
  raw.products.forEach((p: any) => { const k = (p.brand && p.brand.trim()) || "Unbranded"; brandCount[k] = (brandCount[k] || 0) + 1; });
  const brandData = Object.entries(brandCount).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 12);
  const bands: [string, number, number][] = [["<$100", 0, 100], ["$100–500", 100, 500], ["$500–1k", 500, 1000], ["$1k–5k", 1000, 5000], ["$5k+", 5000, 1e12]];
  const priceBands = bands.map(([label, lo, hi]) => ({ label, value: raw.products.filter((p: any) => { const pr = Number(p.price || 0); return pr >= lo && pr < hi; }).length }));
  const badgeSeg = [{ label: "Sale", value: raw.products.filter((p: any) => p.badge === "Sale").length, color: "#BA7517" }, { label: "New", value: raw.products.filter((p: any) => p.badge === "New").length, color: "#378ADD" }, { label: "None", value: raw.products.filter((p: any) => !p.badge).length, color: "#C9CDD2" }];
  const onSaleArr = raw.products.filter((p: any) => p.was_price && Number(p.was_price) > Number(p.price));
  const avgDisc = onSaleArr.length > 0 ? onSaleArr.reduce((s: number, p: any) => s + (Number(p.was_price) - Number(p.price)) / Number(p.was_price), 0) / onSaleArr.length : 0;

  const withRev = raw.products.filter((p: any) => Number(p.reviews || 0) > 0);
  const coverage = raw.products.length > 0 ? withRev.length / raw.products.length : 0;
  const zeroReview = raw.products.length - withRev.length;
  const bestReviewed = [...raw.products].sort((a: any, b: any) => Number(b.reviews || 0) - Number(a.reviews || 0)).slice(0, 6).map((p: any) => ({ name: p.name, rating: Number(p.rating || 0), reviews: Number(p.reviews || 0) }));

  // payments
  let collected = 0, outstanding = 0, refunded = 0, failed = 0;
  const methodRev: Record<string, number> = {}; const statusCount: Record<string, number> = {};
  if (payEnabled) raw.orders.forEach((o: any) => {
    const st = o.payment_status || "pending"; statusCount[st] = (statusCount[st] || 0) + 1;
    const amt = Number(o.amount_paid || 0), tot = Number(o.total || 0);
    if (st === "paid") { const v = amt || tot; collected += v; const mk = o.payment_method || "card"; methodRev[mk] = (methodRev[mk] || 0) + v; }
    else if (st === "pending" && o.status !== "cancelled") outstanding += tot;
    else if (st === "refunded") refunded += tot;
    else if (st === "failed") failed += tot;
  });
  const collectionRate = bookedTotal > 0 ? collected / bookedTotal : 0;
  const paySeg = [{ label: "Paid", value: statusCount.paid || 0, color: "#3B6D11" }, { label: "Pending", value: statusCount.pending || 0, color: "#BA7517" }, { label: "Refunded", value: statusCount.refunded || 0, color: "#888780" }, { label: "Failed", value: statusCount.failed || 0, color: "#BE1E2D" }];
  const methodLabel: Record<string, string> = { card: "Credit card", affirm: "Affirm (BNPL)", terms: "Net terms", wire: "Wire transfer" };
  const methodData = Object.entries(methodRev).map(([k, v]) => ({ label: methodLabel[k] || k, value: v })).sort((a, b) => b.value - a.value);

  return {
    invEnabled, payEnabled, labels, wlabels,
    curRev, curOrd, acctCur, guestCur, aovCur, curSub, curFr, curUnits, skusSold: skusSoldSet.size, curSignups, curSubs,
    actCur, fulCur, rateCur, backlog, nSub, nProc, pendingDealers, openClaims, openTickets,
    revDelta: mkDelta(curRev, prevRev), ordDelta: mkDelta(curOrd, prevOrd), aovDelta: mkDelta(aovCur, aovPrev),
    unitDelta: mkDelta(curUnits, prevUnits), signDelta: mkDelta(curSignups, prevSignups), rateDelta: mkDelta(rateCur, ratePrev),
    revA, revB, ordA, ordB, cumA, cumB, stageSeg, bookedTotal,
    catRevData, topProducts, discRev, fullRev, markdown, dead, deadTied, items0: raw.items.length === 0,
    accW, subW, dealerRev, retailRev, dealerOrd, retailOrd, revPerDealer, pApp, aApp, rApp, approvalRate, topAccounts, recency, confirmedPct,
    funnel, cancelledCount, cancelPctAll, cancCur, allCur, cancRateCur, cancDelta: mkDelta(cancRateCur, cancRatePrev),
    freightPctCur, freightDelta: mkDelta(freightPctCur, freightPctPrev),
    claimData, claimTotal, claimApproval, claimBacklog, tOpen, tDone, tInProg, aging, intake,
    invValue, invUnits, skusStocked, backCount, backRetail, lostDemand, catValData, topSku, healthRows,
    brandData, priceBands, badgeSeg, onSale: onSaleArr.length, avgDisc, coverage, zeroReview, bestReviewed,
    products: raw.products.length, orders: raw.orders.length,
    collected, outstanding, refunded, failed, collectionRate, paySeg, methodData, statusCount,
  };
}
