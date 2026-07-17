"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "./StoreProvider";
import { ILLUS } from "@/lib/illus";
import { money } from "@/lib/format";
import { getProducts } from "@/lib/catalog";
import { readCompare, removeCompare, clearCompare, COMPARE_EVENT } from "@/lib/compare";
import { useReviewStatsMap } from "./ReviewStatsProvider";
import { Star, Plus, Close, ArrowRight } from "./icons";
import type { Product } from "@/lib/types";

export default function CompareView() {
  const { add, openCart } = useStore();
  const statsMap = useReviewStatsMap();
  // null until mounted (localStorage is client-only) so SSR/hydration match.
  const [items, setItems] = useState<Product[] | null>(null);
  const [live, setLive] = useState<Map<string, Product> | null>(null);

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

  useEffect(() => {
    let alive = true;
    getProducts().then((ps) => { if (alive) setLive(new Map(ps.map((p) => [p.slug, p]))); });
    return () => { alive = false; };
  }, []);

  if (items === null) return null;

  // Reconcile the stored snapshots against the live catalog: live price/stock/
  // name win, and a product that's gone from the catalog is dropped (so it can't
  // be compared or added to the cart to poison an order). Until live loads, show
  // the snapshots so there's no flash of empty.
  const products: Product[] = live ? items.map((s) => live.get(s.slug)).filter((p): p is Product => !!p) : items;

  if (products.length === 0) {
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
  for (const p of products) for (const k of Object.keys(p.specs)) if (!specKeys.includes(k)) specKeys.push(k);

  return (
    <>
      <div className="sec-head">
        <h2>Comparing {products.length} {products.length === 1 ? "product" : "products"}</h2>
        <button className="recently-clear" onClick={clearCompare}>Clear all</button>
      </div>

      <div className="cmp-scroll">
        <table className="cmp-table">
          <thead>
            <tr>
              <th className="cmp-corner" />
              {products.map((p) => (
                <th key={p.slug} className="cmp-prod">
                  <button className="cmp-col-x" onClick={() => removeCompare(p.slug)} aria-label={`Remove ${p.name}`}><Close /></button>
                  <Link href={`/products/${p.slug}`} className="cmp-prod-img">
                    {p.images[0] ? <img src={p.images[0]} alt={p.name} loading="lazy" decoding="async" /> : <span className="cmp-thumb-ph" dangerouslySetInnerHTML={{ __html: ILLUS[p.art] }} />}
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
              {products.map((p) => (
                <td key={p.slug} className="cmp-price">
                  {money(p.price)}
                  {p.was ? <span className="cmp-was">{money(p.was)}</span> : null}
                </td>
              ))}
            </tr>
            <tr>
              <th>Rating</th>
              {products.map((p) => {
                const s = statsMap.get(p.slug);
                return (
                  <td key={p.slug}>
                    {s && s.count > 0 ? (
                      <><span className="cmp-stars"><Star /></span> {s.avg.toFixed(1)} ({s.count})</>
                    ) : (
                      <span className="cmp-none">No reviews yet</span>
                    )}
                  </td>
                );
              })}
            </tr>
            <tr>
              <th>Availability</th>
              {products.map((p) => (
                <td key={p.slug} className={p.stock === "in" ? "cmp-instock" : ""}>
                  {p.stock === "in" ? "In stock" : "Backorder"}
                </td>
              ))}
            </tr>
            {specKeys.map((k) => (
              <tr key={k}>
                <th>{k}</th>
                {products.map((p) => <td key={p.slug}>{p.specs[k] ?? <span className="cmp-na">—</span>}</td>)}
              </tr>
            ))}
            <tr className="cmp-actions">
              <th />
              {products.map((p) => (
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
