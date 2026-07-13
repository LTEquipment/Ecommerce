import type { Product } from "./types";

const KEY = "lt-recently-viewed";
const MAX = 8;
export const RECENT_EVENT = "lt:recently-viewed";

/** Record a viewed product (most-recent-first, de-duped, capped). */
export function recordView(p: Product) {
  if (typeof window === "undefined" || !p?.slug) return;
  try {
    const cur: Product[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    const next = [p, ...cur.filter((x) => x.slug !== p.slug)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(RECENT_EVENT));
  } catch {
    /* storage unavailable (private mode / disabled) */
  }
}

export function readViews(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearViews() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(RECENT_EVENT));
  } catch {
    /* noop */
  }
}
