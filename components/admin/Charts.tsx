"use client";

import type { ReactNode } from "react";

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
