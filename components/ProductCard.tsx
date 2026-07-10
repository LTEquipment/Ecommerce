"use client";

import Link from "next/link";
import { useStore } from "./StoreProvider";
import { ILLUS } from "@/lib/illus";
import { money } from "@/lib/format";
import { Star, Plus } from "./icons";
import type { Product } from "@/lib/types";

export default function ProductCard({ p }: { p: Product }) {
  const { add, toast } = useStore();
  const inStock = p.stock === "in";
  const href = `/products/${p.slug}`;
  return (
    <div className="card">
      <Link href={href} className="media" aria-label={p.name}>
        {p.badge ? (
          <span className={`badge${p.badge === "New" ? " new" : ""}`}>{p.badge}</span>
        ) : null}
        {p.images[0] ? (
          <img src={p.images[0]} alt={p.name} loading="lazy" />
        ) : (
          <div className="ph" dangerouslySetInnerHTML={{ __html: ILLUS[p.art] }} />
        )}
        <span className="mlabel">{p.sku}</span>
      </Link>
      <div className="body">
        <div className="sku">Model {p.sku}</div>
        <h3><Link href={href}>{p.name}</Link></h3>
        <div className="rate">
          <span className="stars"><Star /></span> {p.rating.toFixed(1)} ({p.n})
        </div>
        <div className={`stock ${inStock ? "" : "back"}`}>
          <i />
          {inStock ? "In stock · ships 24h" : "Backorder · 2–3 weeks"}
        </div>
        <div className="priced">
          <span className="price">{money(p.price)}</span>
          {p.was ? <span className="was">{money(p.was)}</span> : null}
        </div>
        <button
          className={`addbtn ${inStock ? "" : "back"}`}
          onClick={() => (inStock ? add(p) : toast("We'll email you when it's back."))}
        >
          {inStock ? (<><Plus /> Add to cart</>) : "Notify me"}
        </button>
      </div>
    </div>
  );
}
