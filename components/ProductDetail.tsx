"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "./StoreProvider";
import { useLiveProduct } from "@/lib/useLiveProducts";
import { recordView } from "@/lib/recentlyViewed";
import { money } from "@/lib/format";
import { COMPANY, telHref } from "@/lib/company";
import { ILLUS } from "@/lib/illus";
import { Star, Plus, Truck, Shield, Card } from "./icons";
import type { Product } from "@/lib/types";

export default function ProductDetail({ p: initial }: { p: Product }) {
  const p = useLiveProduct(initial);
  const { add, openCart } = useStore();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const inStock = p.stock === "in";
  const specs = Object.entries(p.specs);

  useEffect(() => { recordView(initial); }, [initial.slug]);

  return (
    <div className="wrap">
      <div className="pdp">
        <div className="gallery">
          <div className="main">
            {p.images[active] ? (
              <img src={p.images[active]} alt={p.name} />
            ) : (
              <div className="ph" dangerouslySetInnerHTML={{ __html: ILLUS[p.art] }} />
            )}
          </div>
          {p.images.length > 1 && (
            <div className="thumbs">
              {p.images.map((src, i) => (
                <button
                  key={src}
                  className={i === active ? "on" : ""}
                  onClick={() => setActive(i)}
                  aria-label={`Image ${i + 1}`}
                >
                  <img src={src} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pinfo">
          {p.brand && <div className="brand-tag">{p.brand}</div>}
          <h1>{p.name}</h1>
          <div className="sku">Model {p.sku}</div>
          <div className="rate">
            <span className="stars"><Star /></span> {p.rating.toFixed(1)} · {p.n} reviews
          </div>
          <div className="priced">
            <span className="price">{money(p.price)}</span>
            {p.was ? <span className="was" style={{ fontSize: 16, color: "var(--muted)", textDecoration: "line-through" }}>{money(p.was)}</span> : null}
          </div>
          <div className={`stock ${inStock ? "" : "back"}`}>
            <i /> {inStock ? "In stock · ships in 24–48 hours" : "Backorder · 2–3 weeks"}
          </div>
          {p.description && <p className="desc">{p.description}</p>}

          <div className="buy-row">
            <div className="qtybox">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="Increase">+</button>
            </div>
            {inStock ? (
              <button className="btn btn-primary btn-lg" onClick={() => { add(p, qty); openCart(); }}>
                <Plus /> Add to cart
              </button>
            ) : (
              <button className="btn btn-line btn-lg">Notify me when available</button>
            )}
          </div>

          <div className="assurance">
            <div className="a"><Truck /> Free freight on orders over $999 · palletized delivery</div>
            <div className="a"><Shield /> NSF / CSA / ETL listed · line-tested warranty</div>
            <div className="a"><Card /> Trade accounts &amp; financing available — <Link href="/login?mode=register&trade=1" style={{ color: "var(--red)", fontWeight: 600 }}>apply</Link></div>
          </div>
        </div>
      </div>

      {specs.length > 0 && (
        <div className="specs">
          <h2>Specifications</h2>
          <div className="spectable">
            {specs.map(([k, v]) => (
              <div className="row" key={k}>
                <div className="k">{k}</div>
                <div className="v">{v}</div>
              </div>
            ))}
          </div>
          <div className="spec-aside">
            <h3>Need a hand speccing this?</h3>
            <p>Our New York team can confirm dimensions, gas type, freight and custom options for your kitchen.</p>
            <a className="btn btn-line btn-block" href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a>
            <div className="certline"><span>NSF</span><span>CSA</span><span>ETL</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
