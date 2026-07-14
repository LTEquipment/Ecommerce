import type { Product } from "./types";

const KEY = "lt-wishlist";
export const WISH_EVENT = "lt:wishlist";

/** Read the saved products (most-recently-added first). */
export function readWishlist(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(items: Product[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(WISH_EVENT));
  } catch {
    /* storage unavailable (private mode / disabled) */
  }
}

export function isWished(slug: string): boolean {
  return readWishlist().some((p) => p.slug === slug);
}

export function wishCount(): number {
  return readWishlist().length;
}

/** Add or remove a product; returns the new saved state (true = now saved). */
export function toggleWish(p: Product): boolean {
  if (typeof window === "undefined" || !p?.slug) return false;
  const cur = readWishlist();
  if (cur.some((x) => x.slug === p.slug)) {
    write(cur.filter((x) => x.slug !== p.slug));
    return false;
  }
  write([p, ...cur]);
  return true;
}

export function removeWish(slug: string) {
  write(readWishlist().filter((p) => p.slug !== slug));
}

export function clearWishlist() {
  write([]);
}
