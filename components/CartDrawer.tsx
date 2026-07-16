"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useStore } from "./StoreProvider";
import QuoteRequest from "./QuoteRequest";
import { money } from "@/lib/format";
import { ILLUS } from "@/lib/illus";
import { Close, Cart } from "./icons";

export default function CartDrawer() {
  const { cart, drawerOpen, closeCart, changeQty, remove, subtotal, count } = useStore();
  const items = Object.values(cart);
  const freight = subtotal >= 999 || subtotal === 0 ? 0 : 89;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [closeCart]);

  return (
    <>
      <div className={`scrim${drawerOpen ? " open" : ""}`} onClick={closeCart} />
      <aside className={`drawer${drawerOpen ? " open" : ""}`} aria-label="Shopping cart" aria-hidden={!drawerOpen}>
        <div className="dhead">
          <h3>
            Cart {count > 0 && <span>· {count} item{count > 1 ? "s" : ""}</span>}
          </h3>
          <button className="close" onClick={closeCart} aria-label="Close cart"><Close /></button>
        </div>
        <div className="ditems">
          {items.length === 0 ? (
            <div className="dempty">
              <Cart />
              <div className="m">Your cart is empty.</div>
            </div>
          ) : (
            items.map(({ product: p, qty: q }) => (
              <div className="ditem" key={p.sku}>
                <Link href={`/products/${p.slug}`} className="thumb" onClick={closeCart}>
                  {p.images[0] ? (
                    <img src={p.images[0]} alt={p.name} loading="lazy" decoding="async" />
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: ILLUS[p.art] }} />
                  )}
                </Link>
                <div className="di-main">
                  <div className="di-sku">{p.sku}</div>
                  <h4>{p.name}</h4>
                  <div className="qty">
                    <button onClick={() => changeQty(p.sku, -1)} aria-label="Decrease">−</button>
                    <span>{q}</span>
                    <button onClick={() => changeQty(p.sku, 1)} aria-label="Increase">+</button>
                  </div>
                </div>
                <div className="di-right">
                  <div className="p">{money(p.price * q)}</div>
                  <button className="rm" onClick={() => remove(p.sku)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="dfoot">
            <div className="line"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="line">
              <span>Freight {subtotal >= 999 ? "(free over $999)" : ""}</span>
              <span>{freight ? money(freight) : "FREE"}</span>
            </div>
            <div className="total">
              <span className="l">Estimated total</span>
              <span className="v">{money(subtotal + freight)}</span>
            </div>
            <div className="btns">
              <Link className="btn btn-primary btn-block" href="/cart" onClick={closeCart}>
                View cart
              </Link>
              <Link className="btn btn-line btn-block" href="/checkout" onClick={closeCart}>
                Checkout
              </Link>
              <QuoteRequest variant="drawer" />
            </div>
            <div className="note">Ships in 24–48h · NSF-certified · line-tested warranty</div>
          </div>
        )}
      </aside>
    </>
  );
}
