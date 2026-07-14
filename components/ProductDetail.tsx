"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "./StoreProvider";
import WishlistButton from "./WishlistButton";
import CompareButton from "./CompareButton";
import { useLiveProduct } from "@/lib/useLiveProducts";
import { recordView } from "@/lib/recentlyViewed";
import { money } from "@/lib/format";
import { estimateMonthly, FINANCE_MIN } from "@/lib/financing";
import { safeHref } from "@/lib/safeHref";
import { COMPANY, telHref } from "@/lib/company";
import { ILLUS } from "@/lib/illus";
import { Star, Plus, Truck, Shield, Card, Search, Close, FileText } from "./icons";
import type { Product } from "@/lib/types";

export default function ProductDetail({ p: initial }: { p: Product }) {
  const p = useLiveProduct(initial);
  const { add, openCart } = useStore();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [hoverZoom, setHoverZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [lightbox, setLightbox] = useState(false);
  const [lbZoom, setLbZoom] = useState(false);
  const inStock = p.stock === "in";
  const specs = Object.entries(p.specs);

  // Point-to-zoom: transform-origin follows the cursor over the image.
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  // Generate a real, printable spec sheet (print-to-PDF) from the product data.
  const printSpecSheet = () => {
    const esc = (s: unknown) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string));
    const rows = Object.entries(p.specs).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("");
    const win = window.open("", "_blank", "width=820,height=1040");
    if (!win) return;
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(p.sku)} — Spec Sheet</title><style>
      *{box-sizing:border-box} body{font-family:Inter,-apple-system,system-ui,sans-serif;color:#17191C;margin:44px;font-size:13px;line-height:1.5}
      .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #17191C;padding-bottom:16px}
      .co{font-weight:800;font-size:16px;letter-spacing:-.01em} .co-sub{color:#6C737A;font-size:11px;margin-top:2px}
      .doc{text-align:right;font-size:11px;color:#6C737A;text-transform:uppercase;letter-spacing:.08em}
      .brand{color:#BE1E2D;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:11px;margin-top:22px}
      h1{font-size:23px;margin:3px 0 2px;letter-spacing:-.02em} .sku{color:#6C737A} .price{font-size:22px;font-weight:800;margin-top:14px}
      table{width:100%;border-collapse:collapse;margin-top:20px} td{padding:9px 11px;border-bottom:1px solid #E2E5E8}
      td:first-child{color:#6C737A;width:42%} .cert{margin-top:26px;padding-top:14px;border-top:1px solid #E2E5E8;color:#6C737A;font-size:11px}
      @media print{body{margin:24px}}
    </style></head><body>
      <div class="hdr"><div><div class="co">L&amp;T Restaurant Equipment</div><div class="co-sub">Panda® · Designed &amp; built in New York · ltfse.com · (917) 204-1697</div></div><div class="doc">Spec Sheet<br>${new Date().toLocaleDateString()}</div></div>
      <div class="brand">${esc(p.brand || "Panda®")}</div><h1>${esc(p.name)}</h1><div class="sku">Model ${esc(p.sku)}</div><div class="price">${esc(money(p.price))}</div>
      ${rows ? `<table>${rows}</table>` : ""}
      <div class="cert">NSF · CSA · ETL listed · Line-tested warranty · Palletized freight nationwide</div>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
  };

  useEffect(() => { recordView(initial); }, [initial.slug]);
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [lightbox]);

  return (
    <div className="wrap">
      <div className="pdp">
        <div className="gallery">
          <div
            className={`main${p.images[active] ? " zoomable" : ""}`}
            onMouseEnter={() => { if (p.images[active]) setHoverZoom(true); }}
            onMouseLeave={() => setHoverZoom(false)}
            onMouseMove={hoverZoom ? onMove : undefined}
            onClick={() => { if (p.images[active]) setLightbox(true); }}
          >
            {p.images[active] ? (
              <>
                <img
                  src={p.images[active]}
                  alt={p.name}
                  style={{ transform: hoverZoom ? "scale(2)" : "scale(1)", transformOrigin: origin }}
                />
                <span className="zoom-hint" aria-hidden="true"><Search /> Hover to zoom · click to expand</span>
              </>
            ) : (
              <div className="ph" dangerouslySetInnerHTML={{ __html: ILLUS[p.art] }} />
            )}
          </div>
          {p.images.length > 1 && (
            <div className="thumbs">
              {p.images.map((src, i) => (
                <button
                  key={src}
                  className={i === active ? "on" : ""}
                  onClick={() => setActive(i)}
                  aria-label={`Image ${i + 1}`}
                >
                  <img src={src} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pinfo">
          {p.brand && <div className="brand-tag">{p.brand}</div>}
          <h1>{p.name}</h1>
          <div className="sku">Model {p.sku}</div>
          <div className="rate">
            <span className="stars"><Star /></span> {p.rating.toFixed(1)} · {p.n} reviews
          </div>
          <div className="priced">
            <span className="price">{money(p.price)}</span>
            {p.was ? <span className="was" style={{ fontSize: 16, color: "var(--muted)", textDecoration: "line-through" }}>{money(p.was)}</span> : null}
          </div>
          {p.price >= FINANCE_MIN && (
            <p className="pdp-finance" title="Estimated monthly payment over 36 months. Subject to credit approval; see financing.">
              As low as <b>{money(estimateMonthly(p.price))}/mo</b> with{" "}
              <span className="affirm">Affirm</span>.{" "}
              <Link href="/financing">Prequalify now</Link>
            </p>
          )}
          <div className={`stock ${inStock ? "" : "back"}`}>
            <i /> {inStock ? "In stock · ships in 24–48 hours" : "Backorder · 2–3 weeks"}
          </div>
          {p.description && <p className="desc">{p.description}</p>}

          <div className="buy-row">
            <div className="qtybox">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="Increase">+</button>
            </div>
            {inStock ? (
              <button className="btn btn-primary btn-lg" onClick={() => { add(p, qty); openCart(); }}>
                <Plus /> Add to cart
              </button>
            ) : (
              <button className="btn btn-line btn-lg">Notify me when available</button>
            )}
            <WishlistButton p={p} variant="pdp" />
          </div>

          <div className="pdp-compare-row">
            <CompareButton p={p} variant="pdp" />
          </div>

          <div className="assurance">
            <div className="a"><Truck /> Free freight on orders over $999 · palletized delivery</div>
            <div className="a"><Shield /> NSF / CSA / ETL listed · line-tested warranty</div>
            <div className="a"><Card /> Trade accounts &amp; financing available — <Link href="/login?mode=register&trade=1" style={{ color: "var(--red)", fontWeight: 600 }}>apply</Link></div>
          </div>
        </div>
      </div>

      {specs.length > 0 && (
        <div className="specs">
          <h2>Specifications</h2>
          <div className="spectable">
            {specs.map(([k, v]) => (
              <div className="row" key={k}>
                <div className="k">{k}</div>
                <div className="v">{v}</div>
              </div>
            ))}
          </div>
          <div className="spec-aside">
            <div className="aside-block">
              <h3>Resources &amp; downloads</h3>
              <div className="res-list">
                <button type="button" className="res-row" onClick={printSpecSheet}>
                  <span className="res-row-ic"><FileText /></span>
                  <span className="res-row-txt"><b>Spec sheet</b><span>Print or save PDF</span></span>
                </button>
                {(p.documents ?? []).map((d, i) => {
                  const href = safeHref(d.url);
                  if (!href) return null;
                  return (
                    <a key={i} className="res-row" href={href} target="_blank" rel="noreferrer">
                      <span className="res-row-ic"><FileText /></span>
                      <span className="res-row-txt"><b>{d.label}</b><span>Download</span></span>
                    </a>
                  );
                })}
              </div>
              <p className="res-panel-note">Need a manual, CAD or submittal we don&apos;t list? <a href={`/contact?ref=${encodeURIComponent(p.sku)}`}>Request it →</a></p>
            </div>
            <div className="aside-block aside-help">
              <h3>Need a hand speccing this?</h3>
              <p>Our New York team can confirm dimensions, gas type, freight and custom options for your kitchen.</p>
              <a className="btn btn-line btn-block" href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a>
              <div className="certline"><span>NSF</span><span>CSA</span><span>ETL</span></div>
            </div>
          </div>
        </div>
      )}

      {lightbox && p.images[active] && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={p.name} onClick={() => setLightbox(false)}>
          <button className="lightbox-close" onClick={() => setLightbox(false)} aria-label="Close"><Close /></button>
          <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
            <img
              src={p.images[active]}
              alt={p.name}
              className={lbZoom ? "zoomed" : ""}
              style={lbZoom ? { transformOrigin: origin } : undefined}
              onMouseMove={lbZoom ? onMove : undefined}
              onClick={() => setLbZoom((z) => !z)}
            />
          </div>
          {p.images.length > 1 && (
            <div className="lightbox-thumbs" onClick={(e) => e.stopPropagation()}>
              {p.images.map((src, i) => (
                <button key={src} className={i === active ? "on" : ""} onClick={() => { setActive(i); setLbZoom(false); }} aria-label={`Image ${i + 1}`}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
