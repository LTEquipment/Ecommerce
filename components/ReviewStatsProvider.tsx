"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { ReviewStats } from "@/lib/reviews";

type StatsMap = Map<string, ReviewStats>;

const Ctx = createContext<StatsMap>(new Map());

/**
 * Loads every product's published-review aggregate once (one anon query to the
 * product_review_stats view) and shares it via context, so product cards across
 * the catalog, related, wishlist and compare surfaces show real ratings without
 * a query per card. Empty until loaded — cards simply omit the rating line until
 * a real aggregate arrives.
 */
export function ReviewStatsProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<StatsMap>(new Map());

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    let cancelled = false;
    sb.from("product_review_stats")
      .select("product_slug,avg_rating,review_count")
      .then(({ data }) => {
        if (cancelled || !data) return;
        const next: StatsMap = new Map();
        for (const r of data as Array<{
          product_slug: string;
          avg_rating: number;
          review_count: number;
        }>) {
          if (r.review_count > 0) {
            next.set(r.product_slug, { avg: Number(r.avg_rating), count: Number(r.review_count) });
          }
        }
        setMap(next);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <Ctx.Provider value={map}>{children}</Ctx.Provider>;
}

/** Aggregate for one product, or undefined when it has no published reviews. */
export function useReviewStats(slug: string): ReviewStats | undefined {
  return useContext(Ctx).get(slug);
}

/** The whole slug → stats map (used by catalog "Top Rated" sorting). */
export function useReviewStatsMap(): StatsMap {
  return useContext(Ctx);
}
