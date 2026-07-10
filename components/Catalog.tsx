"use client";

import { useMemo, useState } from "react";
import { useStore } from "./StoreProvider";
import ProductCard from "./ProductCard";
import { Check, Filter } from "./icons";
import type { Category, Product } from "@/lib/types";

const PRICES: { id: string; name: string; t: (p: Product) => boolean }[] = [
  { id: "p1", name: "Under $250", t: (p) => p.price < 250 },
  { id: "p2", name: "$250 – $750", t: (p) => p.price >= 250 && p.price < 750 },
  { id: "p3", name: "$750 – $1,500", t: (p) => p.price >= 750 && p.price < 1500 },
  { id: "p4", name: "$1,500 & up", t: (p) => p.price >= 1500 },
];

export default function Catalog({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const {
    activeCat,
    setActiveCat,
    priceBracket,
    setPriceBracket,
    inStock,
    setInStock,
    query,
    sortBy,
    setSortBy,
    clearFilters,
  } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const countFor = (catId: string) =>
    products.filter((p) => catId === "all" || p.cat === catId).length;

  const list = useMemo(() => {
    const q = query.toLowerCase();
    let l = products.filter(
      (p) =>
        (activeCat === "all" || p.cat === activeCat) &&
        (priceBracket === "all" || PRICES.find((x) => x.id === priceBracket)!.t(p)) &&
        (!inStock || p.stock === "in") &&
        (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    );
    if (sortBy === "low") l = [...l].sort((a, b) => a.price - b.price);
    else if (sortBy === "high") l = [...l].sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") l = [...l].sort((a, b) => b.rating - a.rating);
    return l;
  }, [products, activeCat, priceBracket, inStock, query, sortBy]);

  return (
    <section id="catalog" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head">
          <h2>Best sellers</h2>
          <button className="filters-toggle" onClick={() => setMobileOpen((o) => !o)}>
            <Filter style={{ width: 16, height: 16 }} />
            Filters
          </button>
        </div>
        <div className="shop">
          <aside className={`facets${mobileOpen ? " open" : ""}`} aria-label="Filters">
            <div className="facet">
              <h4>Department</h4>
              <button
                className={`opt${activeCat === "all" ? " on" : ""}`}
                onClick={() => setActiveCat("all")}
              >
                <span className="lft">
                  <span className="box">
                    <Check />
                  </span>
                  All departments
                </span>
                <span className="cnt">{products.length}</span>
              </button>
              {categories.map((c) => (
                <button
                  className={`opt${activeCat === c.id ? " on" : ""}`}
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                >
                  <span className="lft">
                    <span className="box">
                      <Check />
                    </span>
                    {c.name}
                  </span>
                  <span className="cnt">{countFor(c.id)}</span>
                </button>
              ))}
            </div>
            <div className="facet">
              <h4>Price</h4>
              <button
                className={`opt${priceBracket === "all" ? " on" : ""}`}
                onClick={() => setPriceBracket("all")}
              >
                <span className="lft">
                  <span className="box">
                    <Check />
                  </span>
                  Any price
                </span>
              </button>
              {PRICES.map((pr) => (
                <button
                  className={`opt${priceBracket === pr.id ? " on" : ""}`}
                  key={pr.id}
                  onClick={() => setPriceBracket(pr.id)}
                >
                  <span className="lft">
                    <span className="box">
                      <Check />
                    </span>
                    {pr.name}
                  </span>
                </button>
              ))}
            </div>
            <div className="facet">
              <h4>Availability</h4>
              <button
                className={`opt${inStock ? " on" : ""}`}
                onClick={() => setInStock(!inStock)}
              >
                <span className="lft">
                  <span className="box">
                    <Check />
                  </span>
                  In stock only
                </span>
              </button>
            </div>
            <button className="facet-clear" onClick={clearFilters}>
              Clear all filters
            </button>
          </aside>
          <div>
            <div className="toolbar">
              <div className="count">
                Showing <b>{list.length}</b> products
              </div>
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
                <div
                  style={{
                    gridColumn: "1/-1",
                    textAlign: "center",
                    padding: 60,
                    color: "var(--muted)",
                  }}
                >
                  No products match these filters.
                </div>
              ) : (
                list.map((p) => <ProductCard p={p} key={p.sku} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
