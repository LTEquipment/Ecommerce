"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useStore } from "./StoreProvider";
import { useDialog } from "@/lib/useDialog";
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
  // The panel declares role="dialog" aria-modal="true"; useDialog is what
  // actually delivers it — focus in, Tab trapped, Escape to close, focus
  // restored, page scroll locked. Same hook CartDrawer and QuoteRequest use.
  const panel = useDialog<HTMLDivElement>(open, () => setOpen(false));

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
