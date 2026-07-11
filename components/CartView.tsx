"use client";

import Link from "next/link";
import { useStore } from "./StoreProvider";
import { money } from "@/lib/format";
import { ILLUS } from "@/lib/illus";
import { Cart, ArrowRight } from "./icons";

export default function CartView() {
  const { cart, changeQty, remove, subtotal, count } = useStore();
  const items = Object.values(cart);
  const freight = subtotal >= 999 || subtotal === 0 ? 0 : 89;

  if (items.length === 0) {
    return (
      <div className="wrap">
        <header className="page-header"><div className="ph-main"><span className="eyebrow">Cart</span><h1>Your cart</h1></div></header>
        <div className="emptybox">
          <Cart />
          <div className="m">Your cart is empty</div>
          <div className="s">Browse the catalog to add equipment to your order.</div>
          <Link className="btn btn-primary" href="/products">Browse equipment <ArrowRight /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="cartpage">
        <div>
          <h1>Your cart</h1>
          <div className="cart-lines">
            {items.map(({ product: p, qty: q }) => (
              <div className="cart-line" key={p.sku}>
                <Link href={`/products/${p.slug}`} className="thumb">
                  {p.images[0] ? <img src={p.images[0]} alt={p.name} /> : <span dangerouslySetInnerHTML={{ __html: ILLUS[p.art] }} />}
                </Link>
                <div className="cl-main">
                  <div className="cl-sku">Model {p.sku}</div>
                  <h3><Link href={`/products/${p.slug}`}>{p.name}</Link></h3>
                  <div className="qty">
                    <button onClick={() => changeQty(p.sku, -1)} aria-label="Decrease">−</button>
                    <span>{q}</span>
                    <button onClick={() => changeQty(p.sku, 1)} aria-label="Increase">+</button>
                  </div>
                </div>
                <div className="cl-right">
                  <div className="p">{money(p.price * q)}</div>
                  <button className="rm" onClick={() => remove(p.sku)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="summary">
          <h2>Order summary</h2>
          {subtotal > 0 && subtotal < 999 ? (
            <div className="freight-nudge">
              Add <b>{money(999 - subtotal)}</b> more for free freight
              <span className="fbar"><i style={{ width: `${Math.min(100, (subtotal / 999) * 100)}%` }} /></span>
            </div>
          ) : subtotal >= 999 ? (
            <div className="freight-nudge met">✓ You’ve unlocked free freight</div>
          ) : null}
          <div className="line"><span>Subtotal ({count} item{count > 1 ? "s" : ""})</span><b>{money(subtotal)}</b></div>
          <div className="line"><span>Freight {subtotal >= 999 ? "(free over $999)" : ""}</span><b>{freight ? money(freight) : "FREE"}</b></div>
          <div className="line"><span>Tax</span><span>Calculated at checkout</span></div>
          <div className="total"><span>Estimated total</span><span className="v">{money(subtotal + freight)}</span></div>
          <Link className="btn btn-primary btn-block btn-lg" href="/checkout">Proceed to checkout <ArrowRight /></Link>
          <div className="note">Ships in 24–48h · NSF-certified · line-tested warranty</div>
        </div>
      </div>
    </div>
  );
}
