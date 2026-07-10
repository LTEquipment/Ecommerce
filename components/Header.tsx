"use client";

import { useStore } from "./StoreProvider";
import { money } from "@/lib/format";
import { COMPANY } from "@/lib/company";
import { Search, User, Cart, Menu } from "./icons";

export default function Header() {
  const { query, setQuery, openCart, count, subtotal } = useStore();
  return (
    <header>
      <div className="wrap hdr">
        <a className="brand" href="#">
          <span className="brand-logo" role="img" aria-label="L&T Kitchen Supply" />
        </a>
        <label className="big-search">
          <Search />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product, model number, or category…"
            aria-label="Search products"
          />
        </label>
        <div className="hdr-actions">
          <button className="hact acc" aria-label="Account">
            <User />
            <span className="lbl">
              <b>Account</b>
              <span>Sign in</span>
            </span>
          </button>
          <button className="hact" onClick={openCart} aria-label="Open cart">
            <Cart />
            {count > 0 && <span className="cart-count">{count}</span>}
            <span className="lbl">
              <b>Cart</b>
              <span>{money(subtotal)}.00</span>
            </span>
          </button>
          <button className="hact burger" aria-label="Menu">
            <Menu />
          </button>
        </div>
      </div>
      <div className="navrow">
        <div className="wrap">
          <a className="all" href="#catalog">
            <Menu style={{ width: 16, height: 16, marginRight: 8 }} />
            All Departments
          </a>
          <a href="#catalog">Cooking Equipment</a>
          <a href="#catalog">Refrigeration</a>
          <a href="#catalog">Prep &amp; Work Tables</a>
          <a href="#catalog">Smallwares</a>
          <a href="#catalog">Warming &amp; Holding</a>
          <a href="#catalog">Sinks</a>
          <a href="#locations">Locations</a>
          <span className="spacer" />
          <span className="phone">
            Order by phone: <b>{COMPANY.mainPhone}</b>
          </span>
        </div>
      </div>
    </header>
  );
}
