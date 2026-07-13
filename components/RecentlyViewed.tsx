"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { readViews, clearViews, RECENT_EVENT } from "@/lib/recentlyViewed";
import type { Product } from "@/lib/types";

/** Horizontal strip of the shopper's recently viewed products (localStorage). */
export default function RecentlyViewed({ excludeSlug, title = "Recently viewed", max = 4 }: {
  excludeSlug?: string;
  title?: string;
  max?: number;
}) {
  // null on first render (server + hydration) so there is no mismatch.
  const [items, setItems] = useState<Product[] | null>(null);

  useEffect(() => {
    const load = () => setItems(readViews().filter((p) => p.slug !== excludeSlug));
    load();
    window.addEventListener(RECENT_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(RECENT_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, [excludeSlug]);

  if (!items || items.length === 0) return null;

  return (
    <section className="recently">
      <div className="wrap">
        <div className="sec-head">
          <h2>{title}</h2>
          <button className="recently-clear" onClick={clearViews}>Clear</button>
        </div>
        <div className="grid grid-4">
          {items.slice(0, max).map((p) => <ProductCard p={p} key={p.slug} />)}
        </div>
      </div>
    </section>
  );
}
