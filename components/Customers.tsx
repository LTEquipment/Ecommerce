"use client";

import { useState, type CSSProperties } from "react";
import { CUSTOMERS, type Customer } from "@/lib/customers";

function LogoCell({ c, i }: { c: Customer; i: number }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="logocell" style={{ "--i": i } as CSSProperties}>
      {broken ? (
        <span className="logo-name">{c.name}</span>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          className="logo-img"
          src={`/customers/${c.slug}.avif`}
          alt={c.name}
          loading="lazy"
          onError={() => setBroken(true)}
        />
      )}
    </div>
  );
}

export default function Customers() {
  return (
    <section className="customers" aria-label="Our customers">
      <div className="wrap">
        <div className="cust-head">
          <span className="eyebrow">Our customers</span>
          <h2>Trusted by the kitchens you know.</h2>
          <p>
            From celebrated dining rooms and hot-pot groups to casinos, universities and national
            distributors — operators across the industry build their lines around L&amp;T and
            Panda&reg; equipment.
          </p>
        </div>
        <div className="logowall">
          {CUSTOMERS.map((c, i) => (
            <LogoCell c={c} i={i} key={c.slug} />
          ))}
        </div>
      </div>
    </section>
  );
}
