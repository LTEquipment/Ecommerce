"use client";

import { useState, type ReactNode } from "react";

export function ChartCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="chart-card">
      <div className="chart-head"><h3>{title}</h3>{action}</div>
      {children}
    </div>
  );
}

/** Vertical bars — responsive flexbox. */
export function BarChart({ data, height = 150, format = (n: number) => String(n) }: {
  data: { label: string; value: number }[];
  height?: number;
  format?: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const allZero = data.every((d) => d.value === 0);
  return (
    <div className="cbar" style={{ height }}>
      {data.map((d, i) => (
        <div className="cbar-col" key={i} title={`${d.label}: ${format(d.value)}`}>
          <div className="cbar-fill" style={{ height: allZero ? "2px" : `${Math.max(2, (d.value / max) * 100)}%` }} />
          <span className="cbar-x">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Donut ring with a center value + optional legend. */
export function Donut({ segments, centerValue, centerLabel, size = 128 }: {
  segments: { label: string; value: number; color: string }[];
  centerValue: string;
  centerLabel: string;
  size?: number;
}) {
  const total = Math.max(1, segments.reduce((a, s) => a + s.value, 0));
  const r = 46, C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 120 120" width={size} height={size} className="donut" role="img" aria-label={centerLabel}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--line)" strokeWidth="13" />
        {segments.filter((s) => s.value > 0).map((s, i) => {
          const len = (s.value / total) * C;
          const el = (
            <circle key={i} cx="60" cy="60" r={r} fill="none" stroke={s.color} strokeWidth="13"
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)" />
          );
          offset += len;
          return el;
        })}
        <text x="60" y="58" textAnchor="middle" className="donut-v">{centerValue}</text>
        <text x="60" y="74" textAnchor="middle" className="donut-l">{centerLabel}</text>
      </svg>
      <ul className="chart-legend">
        {segments.map((s) => (
          <li key={s.label}><i style={{ background: s.color }} /> {s.label} <b>{s.value}</b></li>
        ))}
      </ul>
    </div>
  );
}

/** Horizontal ranked bars. */
export function HBars({ data, format = (n: number) => String(n) }: {
  data: { label: string; value: number; color?: string }[];
  format?: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) return <div className="chart-empty">No data yet</div>;
  return (
    <div className="hbars">
      {data.map((d, i) => (
        <div className="hbar" key={i}>
          <span className="hbar-l">{d.label}</span>
          <div className="hbar-track"><div className="hbar-fill" style={{ width: `${Math.max(2, (d.value / max) * 100)}%`, background: d.color || "var(--red)" }} /></div>
          <span className="hbar-v">{format(d.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Delta = { pct: number | null; state: "up" | "down" | "flat" | "new" | "none" };

/** KPI-strip card: value + signed % delta vs the previous equal-length period. */
export function KpiDelta({ label, value, delta, sub, hot, onClick }: {
  label: string;
  value: string;
  delta?: Delta;
  sub?: string;
  hot?: boolean;
  onClick?: () => void;
}) {
  const clickable = Boolean(onClick);
  const badge = delta && delta.state !== "none" ? (
    <span className={`kpi-delta ${delta.state}`}>
      {delta.state === "new" ? "NEW"
        : delta.state === "flat" ? "±0%"
        : `${delta.state === "up" ? "▲" : "▼"} ${Math.abs(delta.pct ?? 0).toFixed(delta.pct !== null && Math.abs(delta.pct) < 10 ? 1 : 0)}%`}
    </span>
  ) : null;
  return (
    <button type="button" className={`kpi${hot ? " hot" : ""}${clickable ? " link" : ""}`} onClick={onClick} disabled={!clickable}>
      <span className="kpi-l">{label}</span>
      <span className="kpi-vrow"><span className="kpi-v">{value}</span>{badge}</span>
      {sub && <span className="kpi-s">{sub}</span>}
    </button>
  );
}

/** Two equal-length series overlaid as line/area — current (solid) vs previous (dashed). */
export function DualTrend({ seriesA, seriesB, labels, format = (n: number) => String(n), height = 150, colorA = "#185FA5", colorB = "#9AA0A6", aLabel, bLabel, emptyText = "No data in this range" }: {
  seriesA: number[];
  seriesB?: number[];
  labels: string[];
  format?: (n: number) => string;
  height?: number;
  colorA?: string;
  colorB?: string;
  aLabel?: string;
  bLabel?: string;
  emptyText?: string;
}) {
  const n = seriesA.length;
  const hasB = Array.isArray(seriesB) && seriesB!.length === n && seriesB!.some((v) => v > 0);
  const pool = hasB ? [...seriesA, ...seriesB!] : seriesA;
  const max = Math.max(1, ...pool);
  const allZero = seriesA.every((v) => v === 0) && !hasB;
  const W = 300, H = 100;
  const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * W);
  const y = (v: number) => H - (v / max) * H;
  const line = (s: number[]) => s.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  if (allZero) return <div className="chart-empty" style={{ paddingTop: height / 3 }}>{emptyText}</div>;
  const peak = Math.max(...seriesA);
  const peakIdx = seriesA.indexOf(peak);
  const step = Math.max(1, Math.ceil(n / 6));
  const picks: number[] = [];
  for (let i = 0; i < n; i += step) picks.push(i);
  if (picks[picks.length - 1] !== n - 1) picks.push(n - 1);
  return (
    <div className="trend">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="trend-svg" style={{ height }} role="img" aria-label={aLabel || "trend"}>
        {hasB && <path d={line(seriesB!)} fill="none" stroke={colorB} strokeWidth="1.5" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />}
        <path d={`${line(seriesA)} L${W} ${H} L0 ${H} Z`} fill={colorA} fillOpacity="0.08" />
        <path d={line(seriesA)} fill="none" stroke={colorA} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {peak > 0 && <circle cx={x(peakIdx)} cy={y(peak)} r="2.6" fill={colorA} vectorEffect="non-scaling-stroke" />}
      </svg>
      <div className="trend-x">{picks.map((i) => <span key={i}>{labels[i]}</span>)}</div>
      {(aLabel || bLabel) && (
        <div className="trend-legend">
          {aLabel && <span><i style={{ background: colorA }} />{aLabel}{peak > 0 ? ` · peak ${format(peak)}` : ""}</span>}
          {hasB && bLabel && <span><i className="dash" style={{ background: colorB }} />{bLabel}</span>}
        </div>
      )}
    </div>
  );
}

type Seg = { label?: string; value: number; color: string };
/** One horizontal track subdivided by value share — single-track or one row each. */
export function StackedHBars({ rows, segments, format = (n: number) => String(n), showLegend = true, emptyText = "No data yet" }: {
  rows?: { label: string; segments: Seg[] }[];
  segments?: Seg[];
  format?: (n: number) => string;
  showLegend?: boolean;
  emptyText?: string;
}) {
  const legend = (segs: Seg[]) => showLegend ? (
    <ul className="shb-legend">{segs.map((s, i) => <li key={i}><i style={{ background: s.color }} />{s.label} <b>{format(s.value)}</b></li>)}</ul>
  ) : null;

  if (segments) {
    const total = segments.reduce((a, s) => a + s.value, 0);
    if (total <= 0) return <div className="shb-track empty"><span>{emptyText}</span></div>;
    return (
      <div className="shb">
        <div className="shb-track">
          {segments.filter((s) => s.value > 0).map((s, i) => (
            <div key={i} className="shb-seg" style={{ flexBasis: `${(s.value / total) * 100}%`, background: s.color }} title={`${s.label ?? ""}: ${format(s.value)}`} />
          ))}
        </div>
        {legend(segments)}
      </div>
    );
  }

  const rr = rows ?? [];
  if (rr.length === 0) return <div className="chart-empty">{emptyText}</div>;
  return (
    <div className="shb">
      <div className="shb-rows">
        {rr.map((row, ri) => {
          const total = row.segments.reduce((a, s) => a + s.value, 0);
          return (
            <div className="shb-row" key={ri}>
              <span className="shb-row-l">{row.label}</span>
              <div className="shb-track">
                {total <= 0
                  ? <div className="shb-seg empty" style={{ flexBasis: "100%" }} />
                  : row.segments.filter((s) => s.value > 0).map((s, i) => (
                    <div key={i} className="shb-seg" style={{ flexBasis: `${(s.value / total) * 100}%`, background: s.color }} title={`${s.label ?? ""}: ${format(s.value)}`} />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
      {rr[0] && legend(rr[0].segments.map((s) => ({ ...s, value: rr.reduce((a, r) => a + (r.segments.find((x) => x.label === s.label)?.value ?? 0), 0) })))}
    </div>
  );
}

export type Column = { key: string; label: string; align?: "left" | "right"; format?: (v: any) => string; sortable?: boolean; render?: (row: any) => ReactNode };
/** Compact, optionally client-sortable table with an honest empty body. */
export function DataTable({ columns, rows, initialSort, emptyText, maxRows = 10 }: {
  columns: Column[];
  rows: Record<string, any>[];
  initialSort?: { key: string; dir: "asc" | "desc" };
  emptyText: string;
  maxRows?: number;
}) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(initialSort ?? null);
  if (rows.length === 0) return <div className="chart-empty">{emptyText}</div>;
  let r = rows;
  if (sort) {
    r = [...rows].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }
  r = r.slice(0, maxRows);
  const onSort = (k: string) => setSort((s) => (s && s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "desc" }));
  return (
    <div className="dtable-wrap">
      <table className="dtable">
        <thead>
          <tr>{columns.map((c) => (
            <th key={c.key} className={c.align === "right" ? "r" : ""} onClick={c.sortable ? () => onSort(c.key) : undefined} style={{ cursor: c.sortable ? "pointer" : "default" }}>
              {c.label}{sort?.key === c.key ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
            </th>
          ))}</tr>
        </thead>
        <tbody>
          {r.map((row, ri) => (
            <tr key={ri}>{columns.map((c) => (
              <td key={c.key} className={c.align === "right" ? "r" : ""}>{c.render ? c.render(row) : c.format ? c.format(row[c.key]) : row[c.key]}</td>
            ))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Tiny axis-less trend line for inline micro-trends. */
export function Sparkline({ series, height = 40, color = "#185FA5", emptyText }: {
  series: number[];
  height?: number;
  color?: string;
  emptyText?: string;
}) {
  const max = Math.max(1, ...series);
  const n = series.length;
  const allZero = series.every((v) => v === 0);
  const W = 100, H = 30;
  const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * W);
  const y = (v: number) => H - (v / max) * H;
  const path = series.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  if (allZero) return <div className="spark-empty" style={{ height }}>{emptyText ?? ""}</div>;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="spark-svg" style={{ height }} aria-hidden="true">
      <path d={`${path} L${W} ${H} L0 ${H} Z`} fill={color} fillOpacity="0.10" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
