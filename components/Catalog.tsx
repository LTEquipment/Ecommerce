"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "./StoreProvider";
import { useLiveProducts } from "@/lib/useLiveProducts";
import ProductCard from "./ProductCard";
import { useReviewStatsMap } from "./ReviewStatsProvider";
import { brandSlug } from "@/lib/brands";
import { Check, Filter } from "./icons";
import type { Category, Product } from "@/lib/types";

const PRICES: { id: string; name: string; t: (p: Product) => boolean }[] = [
  { id: "p1", name: "Under $500", t: (p) => p.price < 500 },
  { id: "p2", name: "$500 – $2,500", t: (p) => p.price >= 500 && p.price < 2500 },
  { id: "p3", name: "$2,500 – $10,000", t: (p) => p.price >= 2500 && p.price < 10000 },
  { id: "p4", name: "$10,000 & up", t: (p) => p.price >= 10000 },
];

export default function Catalog({
  categories,
  products: initialProducts,
  title = "Best sellers",
  lockedCat,
  lockedBrand,
  anchor,
}: {
  categories: Category[];
  products: Product[];
  title?: string;
  /** When set, filter to this category and hide the department facet. */
  lockedCat?: string;
  /** When set, filter to this brand slug (brand landing pages). */
  lockedBrand?: string;
  anchor?: string;
}) {
  const products = useLiveProducts(initialProducts);
  const statsMap = useReviewStatsMap();
  const {
    activeCat, setActiveCat,
    activeBrand, setActiveBrand,
    priceBracket, setPriceBracket,
    inStock, setInStock,
    query, setQuery, sortBy, setSortBy, clearFilters,
  } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Make search URL-addressable: /products?q=… (shared links + the schema.org
  // SearchAction) seed the store query so results filter on arrival.
  const searchParams = useSearchParams();
  const urlQ = searchParams.get("q") ?? "";
  useEffect(() => {
    if (urlQ) setQuery(urlQ);
  }, [urlQ, setQuery]);

  const scoped = lockedBrand
    ? products.filter((p) => p.brand && brandSlug(p.brand) === lockedBrand)
    : lockedCat
    ? products.filter((p) => p.cat === lockedCat)
    : products;
  const countBase = lockedBrand ? scoped : products;
  const countFor = (catId: string) =>
    countBase.filter((p) => catId === "all" || p.cat === catId).length;

  // Category-name lookup (so search matches a department name too) and the brand
  // facet list — distinct brands present in scope, only shown off brand landings.
  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name.toLowerCase()])), [categories]);
  const brands = useMemo(() => {
    if (lockedBrand) return [] as string[];
    return [...new Set(countBase.map((p) => p.brand).filter((b): b is string => Boolean(b)))].sort();
  }, [countBase, lockedBrand]);

  const list = useMemo(() => {
    const q = query.toLowerCase().trim();
    let l = scoped.filter(
      (p) =>
        (lockedCat || activeCat === "all" || p.cat === activeCat) &&
        (lockedBrand || activeBrand === "all" || p.brand === activeBrand) &&
        (priceBracket === "all" || PRICES.find((x) => x.id === priceBracket)!.t(p)) &&
        (!inStock || p.stock === "in") &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q) ||
          (catName.get(p.cat) ?? "").includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          Object.values(p.specs ?? {}).some((v) => String(v).toLowerCase().includes(q)))
    );
    if (sortBy === "low") l = [...l].sort((a, b) => a.price - b.price);
    else if (sortBy === "high") l = [...l].sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") {
      // Sort by real aggregate: higher average first, then more reviews.
      // Products without published reviews sort last.
      const score = (p: Product) => {
        const s = statsMap.get(p.slug);
        return s && s.count > 0 ? s.avg + Math.min(s.count, 50) / 1000 : -1;
      };
      l = [...l].sort((a, b) => score(b) - score(a));
    }
    return l;
  }, [scoped, lockedCat, activeCat, lockedBrand, activeBrand, priceBracket, inStock, query, sortBy, statsMap, catName]);

  return (
    <section id={anchor} style={anchor ? { paddingTop: 0 } : undefined}>
      <div className="wrap">
        <div className={`sec-head${title ? "" : " shop-nohead"}`}>
          {title && <h2>{title}</h2>}
          <button className="filters-toggle" onClick={() => setMobileOpen((o) => !o)} aria-expanded={mobileOpen}>
            <Filter style={{ width: 16, height: 16 }} /> Filters
          </button>
        </div>
        <div className="shop">
          <aside className={`facets${mobileOpen ? " open" : ""}`} aria-label="Filters">
            {!lockedCat && (
              <div className="facet">
                <h4>Department</h4>
                <button className={`opt${activeCat === "all" ? " on" : ""}`} onClick={() => setActiveCat("all")}>
                  <span className="lft"><span className="box"><Check /></span>All departments</span>
                  <span className="cnt">{products.length}</span>
                </button>
                {categories.map((c) => (
                  <button className={`opt${activeCat === c.id ? " on" : ""}`} key={c.id} onClick={() => setActiveCat(c.id)}>
                    <span className="lft"><span className="box"><Check /></span>{c.name}</span>
                    <span className="cnt">{countFor(c.id)}</span>
                  </button>
                ))}
              </div>
            )}
            {brands.length > 1 && (
              <div className="facet">
                <h4>Brand</h4>
                <button className={`opt${activeBrand === "all" ? " on" : ""}`} onClick={() => setActiveBrand("all")}>
                  <span className="lft"><span className="box"><Check /></span>All brands</span>
                </button>
                {brands.map((b) => (
                  <button className={`opt${activeBrand === b ? " on" : ""}`} key={b} onClick={() => setActiveBrand(b)}>
                    <span className="lft"><span className="box"><Check /></span>{b}</span>
                    <span className="cnt">{countBase.filter((p) => p.brand === b).length}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="facet">
              <h4>Price</h4>
              <button className={`opt${priceBracket === "all" ? " on" : ""}`} onClick={() => setPriceBracket("all")}>
                <span className="lft"><span className="box"><Check /></span>Any price</span>
              </button>
              {PRICES.map((pr) => (
                <button className={`opt${priceBracket === pr.id ? " on" : ""}`} key={pr.id} onClick={() => setPriceBracket(pr.id)}>
                  <span className="lft"><span className="box"><Check /></span>{pr.name}</span>
                </button>
              ))}
            </div>
            <div className="facet">
              <h4>Availability</h4>
              <button className={`opt${inStock ? " on" : ""}`} onClick={() => setInStock(!inStock)}>
                <span className="lft"><span className="box"><Check /></span>In stock only</span>
              </button>
            </div>
            <button className="facet-clear" onClick={clearFilters}>Clear all filters</button>
          </aside>
          <div>
            <div className="toolbar">
              <div className="count">Showing <b>{list.length}</b> products</div>
              <label className="sort">
                Sort by
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </label>
            </div>
            <div className="grid">
              {list.length === 0 ? (
                <div className="emptybox" style={{ gridColumn: "1/-1" }}>
                  <Filter />
                  <div className="m">{query.trim() ? `No results for “${query.trim()}”` : "No products match these filters"}</div>
                  <div className="s">{query.trim() ? "Check the spelling, or try a model number, brand or department." : "Try widening your price range or turning off “in stock only”."}</div>
                  <button className="btn btn-line" onClick={clearFilters}>Clear all filters</button>
                </div>
              ) : (
                list.map((p) => <ProductCard p={p} key={p.slug} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
