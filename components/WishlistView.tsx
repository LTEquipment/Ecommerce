"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { readWishlist, clearWishlist, WISH_EVENT } from "@/lib/wishlist";
import { ArrowRight } from "./icons";
import type { Product } from "@/lib/types";

export default function WishlistView() {
  // null until mounted so server + hydration match (localStorage is client-only).
  const [items, setItems] = useState<Product[] | null>(null);

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

  if (items === null) return null;

  if (items.length === 0) {
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
        <h2>{items.length} saved {items.length === 1 ? "item" : "items"}</h2>
        <button className="recently-clear" onClick={clearWishlist}>Clear all</button>
      </div>
      <div className="grid grid-4">
        {items.map((p) => <ProductCard p={p} key={p.slug} />)}
      </div>
    </>
  );
}
