"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ILLUS } from "@/lib/illus";
import { readCompare, removeCompare, clearCompare, COMPARE_EVENT } from "@/lib/compare";
import { Close, ArrowRight } from "./icons";
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

  return (
    <div className="cmp-tray" role="region" aria-label="Compare products">
      <div className="wrap cmp-tray-in">
        <div className="cmp-tray-items">
          {items.map((p) => (
            <div className="cmp-thumb" key={p.slug}>
              {p.images[0] ? (
                <img src={p.images[0]} alt={p.name} />
              ) : (
                <span className="cmp-thumb-ph" dangerouslySetInnerHTML={{ __html: ILLUS[p.art] }} />
              )}
              <button className="cmp-thumb-x" onClick={() => removeCompare(p.slug)} aria-label={`Remove ${p.name}`}>
                <Close />
              </button>
            </div>
          ))}
        </div>
        <div className="cmp-tray-actions">
          <button className="cmp-tray-clear" onClick={clearCompare}>Clear</button>
          {ready ? (
            <Link className="btn btn-primary" href="/compare">Compare ({items.length}) <ArrowRight /></Link>
          ) : (
            <span className="cmp-tray-hint">Add 1 more to compare</span>
          )}
        </div>
      </div>
    </div>
  );
}
