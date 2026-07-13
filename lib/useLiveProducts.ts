"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { ArtKey, Product } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
function patch(r: any): Partial<Product> {
  return {
    price: Number(r.price),
    was: r.was_price != null ? Number(r.was_price) : undefined,
    badge: (r.badge ?? "") as Product["badge"],
    stock: (r.stock ?? "in") as Product["stock"],
    rating: Number(r.rating ?? 4.7),
    n: r.reviews ?? 0,
    name: r.name,
  };
}
/** Full row → Product, for INSERTs of brand-new products. */
function fullProduct(r: any): Product {
  return {
    slug: r.slug, sku: r.sku, name: r.name, cat: r.category_id,
    art: (r.art ?? "range") as ArtKey, price: Number(r.price),
    was: r.was_price != null ? Number(r.was_price) : undefined,
    images: r.images ?? [], specs: r.specs ?? {}, description: r.description ?? undefined,
    brand: r.brand ?? undefined, rating: Number(r.rating ?? 4.7), n: r.reviews ?? 0,
    badge: (r.badge ?? "") as Product["badge"], stock: (r.stock ?? "in") as Product["stock"],
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Live list of products: seeded from SSR, patched by Supabase Realtime UPDATEs. */
export function useLiveProducts(initial: Product[]): Product[] {
  const [products, setProducts] = useState<Product[]>(initial);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const channel = sb
      .channel("rt-products")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products" },
        (p) => {
          const row = p.new as { slug: string };
          setProducts((prev) =>
            prev.map((prod) => (prod.slug === row.slug ? { ...prod, ...patch(p.new) } : prod))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "products" },
        (p) => {
          const prod = fullProduct(p.new);
          setProducts((prev) => (prev.some((x) => x.slug === prod.slug) ? prev : [...prev, prod]));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "products" },
        (p) => {
          const slug = (p.old as { slug?: string }).slug;
          if (slug) setProducts((prev) => prev.filter((x) => x.slug !== slug));
        }
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  return products;
}

/** Live single product. */
export function useLiveProduct(initial: Product): Product {
  const [product, setProduct] = useState<Product>(initial);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const channel = sb
      .channel(`rt-product-${initial.slug}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products", filter: `slug=eq.${initial.slug}` },
        (p) => setProduct((prev) => ({ ...prev, ...patch(p.new) }))
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [initial.slug]);

  return product;
}
