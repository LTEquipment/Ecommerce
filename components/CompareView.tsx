"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "./StoreProvider";
import { ILLUS } from "@/lib/illus";
import { money } from "@/lib/format";
import { readCompare, removeCompare, clearCompare, COMPARE_EVENT } from "@/lib/compare";
import { Star, Plus, Close, ArrowRight } from "./icons";
import type { Product } from "@/lib/types";

export default function CompareView() {
  const { add, openCart } = useStore();
  // null until mounted (localStorage is client-only) so SSR/hydration match.
  const [items, setItems] = useState<Product[] | null>(null);

  useEffect(() => {
    const load = () => setItems(readCompare());
    load();
    window.addEventListener(COMPARE_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(COMPARE_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  if (items === null) return null;

  if (items.length === 0) {
    return (
      <div className="cmp-empty">
        <h2>Nothing to compare yet</h2>
        <p>Add two or more products — use the “Compare” button on any product to line them up side by side.</p>
        <Link className="btn btn-primary btn-lg" href="/products">Browse equipment <ArrowRight /></Link>
      </div>
    );
  }

  // Union of every spec key across the compared products, first-seen order.
  const specKeys: string[] = [];
  for (const p of items) for (const k of Object.keys(p.specs)) if (!specKeys.includes(k)) specKeys.push(k);

  return (
    <>
      <div className="sec-head">
        <h2>Comparing {items.length} {items.length === 1 ? "product" : "products"}</h2>
        <button className="recently-clear" onClick={clearCompare}>Clear all</button>
      </div>

      <div className="cmp-scroll">
        <table className="cmp-table">
          <thead>
            <tr>
              <th className="cmp-corner" />
              {items.map((p) => (
                <th key={p.slug} className="cmp-prod">
                  <button className="cmp-col-x" onClick={() => removeCompare(p.slug)} aria-label={`Remove ${p.name}`}><Close /></button>
                  <Link href={`/products/${p.slug}`} className="cmp-prod-img">
                    {p.images[0] ? <img src={p.images[0]} alt={p.name} /> : <span className="cmp-thumb-ph" dangerouslySetInnerHTML={{ __html: ILLUS[p.art] }} />}
                  </Link>
                  {p.brand && <span className="cmp-brand">{p.brand}</span>}
                  <Link href={`/products/${p.slug}`} className="cmp-prod-name">{p.name}</Link>
                  <span className="cmp-prod-sku">Model {p.sku}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Price</th>
              {items.map((p) => (
                <td key={p.slug} className="cmp-price">
                  {money(p.price)}
                  {p.was ? <span className="cmp-was">{money(p.was)}</span> : null}
                </td>
              ))}
            </tr>
            <tr>
              <th>Rating</th>
              {items.map((p) => (
                <td key={p.slug}><span className="cmp-stars"><Star /></span> {p.rating.toFixed(1)} ({p.n})</td>
              ))}
            </tr>
            <tr>
              <th>Availability</th>
              {items.map((p) => (
                <td key={p.slug} className={p.stock === "in" ? "cmp-instock" : ""}>
                  {p.stock === "in" ? "In stock" : "Backorder"}
                </td>
              ))}
            </tr>
            {specKeys.map((k) => (
              <tr key={k}>
                <th>{k}</th>
                {items.map((p) => <td key={p.slug}>{p.specs[k] ?? <span className="cmp-na">—</span>}</td>)}
              </tr>
            ))}
            <tr className="cmp-actions">
              <th />
              {items.map((p) => (
                <td key={p.slug}>
                  {p.stock === "in" ? (
                    <button className="btn btn-primary btn-block" onClick={() => { add(p); openCart(); }}><Plus /> Add to cart</button>
                  ) : (
                    <Link className="btn btn-line btn-block" href={`/products/${p.slug}`}>View</Link>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
