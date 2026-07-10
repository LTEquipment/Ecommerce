"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "./StoreProvider";
import { useAuth } from "./AuthProvider";
import { money } from "@/lib/format";
import { COMPANY } from "@/lib/company";
import { CATEGORIES } from "@/lib/products";
import { Search, User, Cart, Menu, ChevronDown, Package, LogOut } from "./icons";

const NAV = CATEGORIES.slice(0, 6);

export default function Header() {
  const { query, setQuery, openCart, openNav, count, subtotal } = useStore();
  const { user, displayName, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const acctRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/products");
  };

  return (
    <header>
      <div className="wrap hdr">
        <Link className="brand" href="/" aria-label="L&T — home">
          <span className="brand-logo" role="img" aria-label="L&T Restaurant Equipment" />
        </Link>

        <form className="big-search" onSubmit={submitSearch} role="search">
          <Search />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product, model number, or category…"
            aria-label="Search products"
          />
        </form>

        <div className="hdr-actions">
          {/* desktop account */}
          {user ? (
            <div className="acct-wrap hact acc" ref={acctRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                style={{ display: "flex", alignItems: "center", gap: 9 }}
              >
                <User />
                <span className="lbl">
                  <b>Account</b>
                  <span>{displayName}</span>
                </span>
                <ChevronDown style={{ width: 15, height: 15 }} />
              </button>
              {menuOpen && (
                <div className="acct-menu" role="menu">
                  <div className="who">
                    <b>{displayName}</b>
                    <span>{user.email}</span>
                  </div>
                  <Link href="/account" role="menuitem" onClick={() => setMenuOpen(false)}>
                    <User /> Account
                  </Link>
                  <Link href="/account?tab=orders" role="menuitem" onClick={() => setMenuOpen(false)}>
                    <Package /> Orders
                  </Link>
                  <button role="menuitem" onClick={() => { setMenuOpen(false); signOut(); }}>
                    <LogOut /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link className="hact acc" href="/login">
              <User />
              <span className="lbl">
                <b>Account</b>
                <span>Sign in</span>
              </span>
            </Link>
          )}

          {/* desktop cart */}
          <button className="hact" onClick={openCart} aria-label="Open cart">
            <Cart />
            {count > 0 && <span className="cart-count">{count}</span>}
            <span className="lbl">
              <b>Cart</b>
              <span>{money(subtotal)}</span>
            </span>
          </button>

          {/* mobile icon bar */}
          <button className="icon-btn" onClick={openNav} aria-label="Search">
            <Search />
          </button>
          <Link className="icon-btn" href={user ? "/account" : "/login"} aria-label="Account">
            <User />
          </Link>
          <button className="icon-btn" onClick={openCart} aria-label="Open cart">
            <Cart />
            {count > 0 && <span className="cart-count">{count}</span>}
          </button>
          <button className="icon-btn" onClick={openNav} aria-label="Menu">
            <Menu />
          </button>
        </div>
      </div>

      <div className="navrow">
        <div className="wrap">
          <Link className="all" href="/products">
            <Menu style={{ width: 16, height: 16 }} />
            All Departments
          </Link>
          {NAV.map((c) => (
            <Link key={c.id} href={`/category/${c.id}`}>
              {c.name}
            </Link>
          ))}
          <Link href="/locations">Locations</Link>
          <span className="spacer" />
          <span className="phone">
            Order by phone: <b>{COMPANY.mainPhone}</b>
          </span>
        </div>
      </div>
    </header>
  );
}
