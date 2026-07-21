"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useStore } from "./StoreProvider";
import WishlistButton from "./WishlistButton";
import { money } from "@/lib/format";
import { Close, Plus, Search } from "./icons";
import type { Product } from "@/lib/types";

/** Quick-view: peek a product's key info + add to cart without leaving the grid. */
export default function QuickView({ p }: { p: Product }) {
  const { add, openCart, toast } = useStore();
  const [open, setOpen] = useState(false);
  const inStock = p.stock === "in";
  const specs = Object.entries(p.specs ?? {}).slice(0, 6);
  const panel = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  // The panel already declares role="dialog" aria-modal="true", but nothing
  // backed that up: Escape did not close it, focus never entered it, and the
  // page behind kept scrolling. Every other overlay here (cookie banner, PDP
  // lightbox, facets sheet) does all three.
  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    (panel.current?.querySelector<HTMLElement>(
      'button,a[href],input,[tabindex]:not([tabindex="-1"])'
    ) ?? panel.current)?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      restoreTo.current?.focus?.();
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="qv-trigger"
        aria-label={`Quick view ${p.name}`}
        title="Quick view"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
      >
        <Search />
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div className="qv-overlay" onClick={() => setOpen(false)}>
          <div className="qv-modal" ref={panel} tabIndex={-1} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={p.name}>
            <button className="qv-close" onClick={() => setOpen(false)} aria-label="Close"><Close /></button>
            <div className="qv-media">{p.images[0] ? <img src={p.images[0]} alt={p.name} loading="lazy" decoding="async" /> : null}</div>
            <div className="qv-info">
              {p.brand && <div className="qv-brand">{p.brand}</div>}
              <h3>{p.name}</h3>
              <div className="qv-sku">Model {p.sku}</div>
              <div className="qv-price">{money(p.price)}{p.was ? <span className="qv-was">{money(p.was)}</span> : null}</div>
              <div className={`stock ${inStock ? "" : "back"}`}><i /> {inStock ? "In stock · ships 24–48h" : "Backorder · 2–3 weeks"}</div>
              {specs.length > 0 && (
                <dl className="qv-specs">
                  {specs.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
                </dl>
              )}
              <div className="qv-actions">
                {inStock ? (
                  <button className="btn btn-primary" onClick={() => { add(p); openCart(); setOpen(false); }}><Plus /> Add to cart</button>
                ) : (
                  <button className="btn btn-line" onClick={() => toast("We'll email you when it's back.")}>Notify me</button>
                )}
                <WishlistButton p={p} variant="pdp" />
              </div>
              <Link href={`/products/${p.slug}`} className="qv-full" onClick={() => setOpen(false)}>View full details →</Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
