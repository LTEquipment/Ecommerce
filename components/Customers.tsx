"use client";

import { useState, type CSSProperties } from "react";
import { CUSTOMERS, type Customer } from "@/lib/customers";

const ROW_COUNT = 3;
const DURATIONS = [56, 68, 62]; // seconds/loop — staggered so the ribbons never lock in sync

// Split the roster into contiguous ribbons.
function chunk(arr: Customer[], n: number): Customer[][] {
  const size = Math.ceil(arr.length / n);
  return Array.from({ length: n }, (_, i) => arr.slice(i * size, i * size + size));
}
const ROWS = chunk(CUSTOMERS, ROW_COUNT);

function Logo({ c, dup = false }: { c: Customer; dup?: boolean }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className={`mq-logo${dup ? " mq-dup" : ""}`}>
      {broken ? (
        <span className="logo-name">{c.name}</span>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          className="logo-img"
          src={`/customers/${c.slug}.avif`}
          alt={dup ? "" : c.name}
          aria-hidden={dup || undefined}
          loading="lazy"
          onError={() => setBroken(true)}
        />
      )}
    </div>
  );
}

function Ribbon({ items, reverse, dur }: { items: Customer[]; reverse: boolean; dur: number }) {
  return (
    <div className="mq-row">
      {/* content is rendered twice so translateX(-50%) loops seamlessly */}
      <div className={`mq-track${reverse ? " mq-rev" : ""}`} style={{ "--dur": `${dur}s` } as CSSProperties}>
        {items.map((c) => <Logo c={c} key={"a" + c.slug} />)}
        {items.map((c) => <Logo c={c} dup key={"b" + c.slug} />)}
      </div>
    </div>
  );
}

export default function Customers() {
  return (
    <section className="customers" aria-label="Our customers">
      <div className="cust-head">
        <h2 className="cust-label">Trusted by professional kitchens</h2>
      </div>
      <div className="marquee">
        {ROWS.map((items, i) => (
          <Ribbon key={i} items={items} reverse={i % 2 === 1} dur={DURATIONS[i % DURATIONS.length]} />
        ))}
      </div>
    </section>
  );
}
