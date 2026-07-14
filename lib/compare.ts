import type { Product } from "./types";

const KEY = "lt-compare";
export const COMPARE_EVENT = "lt:compare";
/** Compare holds at most this many products (table stays readable). */
export const COMPARE_MAX = 4;

export function readCompare(): Product[] {
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
    window.dispatchEvent(new Event(COMPARE_EVENT));
  } catch {
    /* storage unavailable */
  }
}

export function isCompared(slug: string): boolean {
  return readCompare().some((p) => p.slug === slug);
}

export function compareCount(): number {
  return readCompare().length;
}

/**
 * Add or remove a product from the compare set.
 * Returns "added" | "removed" | "full" (at the cap and not already in it).
 */
export function toggleCompare(p: Product): "added" | "removed" | "full" {
  if (typeof window === "undefined" || !p?.slug) return "removed";
  const cur = readCompare();
  if (cur.some((x) => x.slug === p.slug)) {
    write(cur.filter((x) => x.slug !== p.slug));
    return "removed";
  }
  if (cur.length >= COMPARE_MAX) return "full";
  write([...cur, p]);
  return "added";
}

export function removeCompare(slug: string) {
  write(readCompare().filter((p) => p.slug !== slug));
}

export function clearCompare() {
  write([]);
}
