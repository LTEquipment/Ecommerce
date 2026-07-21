"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "./StoreProvider";
import { useAuth } from "./AuthProvider";
import { Home, Grid, Search, Cart, User } from "./icons";

/**
 * Phone-only bottom navigation. Phones navigate from the thumb, not from a
 * hamburger at the top — the header menu stays for secondary destinations.
 * Hidden above 767px and wherever site chrome is suppressed (admin).
 */
export default function MobileTabBar() {
  const path = usePathname() ?? "/";
  const { count, openCart, openNav } = useStore();
  const { user } = useAuth();

  const on = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <nav className="tabbar" aria-label="Primary">
      <Link href="/" className={`tab${on("/") ? " on" : ""}`} aria-current={on("/") ? "page" : undefined}>
        <Home aria-hidden="true" />
        <span>Home</span>
      </Link>

      <Link
        href="/products"
        className={`tab${on("/products") || on("/category") ? " on" : ""}`}
        aria-current={on("/products") ? "page" : undefined}
      >
        <Grid aria-hidden="true" />
        <span>Shop</span>
      </Link>

      {/* Search lives in the nav drawer, which already owns the search field. */}
      <button type="button" className="tab" onClick={openNav}>
        <Search aria-hidden="true" />
        <span>Search</span>
      </button>

      <button type="button" className="tab" onClick={openCart} aria-label={`Cart, ${count} items`}>
        <span className="tab-badge-wrap">
          <Cart aria-hidden="true" />
          {count > 0 && <span className="tab-badge">{count > 99 ? "99+" : count}</span>}
        </span>
        <span>Cart</span>
      </button>

      <Link
        href={user ? "/account" : "/login"}
        className={`tab${on("/account") || on("/login") ? " on" : ""}`}
      >
        <User aria-hidden="true" />
        <span>Account</span>
      </Link>
    </nav>
  );
}
