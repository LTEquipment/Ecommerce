"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ILLUS } from "@/lib/illus";
import { readCompare, removeCompare, clearCompare, COMPARE_EVENT, COMPARE_MAX } from "@/lib/compare";
import { Close, ArrowRight, Compare, Plus } from "./icons";
import type { Product } from "@/lib/types";

/** Floating bar that collects products to compare and links to /compare. */
export default function CompareTray() {
  const path = usePathname();
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const load = () => setItems(readCompare());
    load();
    window.addEventListener(COMPARE_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(COMPARE_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  if (items.length === 0 || path === "/compare") return null;
  const ready = items.length >= 2;
  const emptySlots = Math.max(0, COMPARE_MAX - items.length);
  const need = 2 - items.length;

  return (
    <div className="cmp-tray" role="region" aria-label="Compare products">
      <div className="wrap cmp-tray-in">
        <div className="cmp-tray-lead">
          <span className="cmp-tray-label">
            <Compare />
            <span className="cmp-tray-kicker">Compare</span>
            <span className="cmp-tray-count">{items.length} of {COMPARE_MAX}</span>
          </span>
          <div className="cmp-tray-items">
            {items.map((p) => (
              <div className="cmp-thumb" key={p.slug} title={p.name}>
                {p.images[0] ? (
                  <img src={p.images[0]} alt={p.name} loading="lazy" decoding="async" />
                ) : (
                  <span className="cmp-thumb-ph" dangerouslySetInnerHTML={{ __html: ILLUS[p.art] }} />
                )}
                <button
                  className="cmp-thumb-x"
                  onClick={() => removeCompare(p.slug)}
                  aria-label={`Remove ${p.name}`}
                >
                  <Close />
                </button>
              </div>
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <Link
                className="cmp-slot"
                key={i}
                href="/products"
                aria-label="Add another product to compare"
                title="Add another product to compare"
              >
                <Plus />
              </Link>
            ))}
          </div>
        </div>

        <div className="cmp-tray-actions">
          <button className="cmp-tray-clear" onClick={clearCompare}>Clear all</button>
          {ready ? (
            <Link className="btn btn-primary cmp-tray-go" href="/compare">
              Compare {items.length} <ArrowRight />
            </Link>
          ) : (
            <>
              <span className="cmp-tray-hint">Add {need} more to compare</span>
              <button className="btn btn-primary cmp-tray-go" disabled aria-disabled="true">
                Compare <ArrowRight />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
