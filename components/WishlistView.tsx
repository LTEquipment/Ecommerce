"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { getProducts } from "@/lib/catalog";
import { readWishlist, clearWishlist, WISH_EVENT } from "@/lib/wishlist";
import { ArrowRight } from "./icons";
import type { Product } from "@/lib/types";

export default function WishlistView() {
  // null until mounted so server + hydration match (localStorage is client-only).
  const [items, setItems] = useState<Product[] | null>(null);
  const [live, setLive] = useState<Map<string, Product> | null>(null);

  useEffect(() => {
    const load = () => setItems(readWishlist());
    load();
    window.addEventListener(WISH_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(WISH_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    getProducts().then((ps) => { if (alive) setLive(new Map(ps.map((p) => [p.slug, p]))); });
    return () => { alive = false; };
  }, []);

  if (items === null) return null;

  // Refresh the saved snapshots from the live catalog (price/stock) and drop any
  // product that no longer exists, so the card and its add-to-cart use live data.
  const products: Product[] = live ? items.map((s) => live.get(s.slug)).filter((p): p is Product => !!p) : items;

  if (products.length === 0) {
    return (
      <div className="wish-empty">
        <h2>Your wishlist is empty</h2>
        <p>Save equipment you&apos;re speccing — tap the heart on any product to keep it here.</p>
        <Link className="btn btn-primary btn-lg" href="/products">Browse equipment <ArrowRight /></Link>
      </div>
    );
  }

  return (
    <>
      <div className="sec-head">
        <h2>{products.length} saved {products.length === 1 ? "item" : "items"}</h2>
        <button className="recently-clear" onClick={clearWishlist}>Clear all</button>
      </div>
      <div className="grid grid-4">
        {products.map((p) => <ProductCard p={p} key={p.slug} />)}
      </div>
    </>
  );
}
