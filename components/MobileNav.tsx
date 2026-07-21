"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "./StoreProvider";
import { useAuth } from "./AuthProvider";
import { COMPANY, telHref } from "@/lib/company";
import { CATEGORIES } from "@/lib/products";
import { Search, Close, User, Package, LogOut, Shield, Heart, Store } from "./icons";

export default function MobileNav() {
  const { navOpen, closeNav, query, setQuery } = useStore();
  const { user, displayName, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNav();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [closeNav]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    closeNav();
    router.push("/products");
  };

  return (
    <>
      <div className={`scrim nav${navOpen ? " open" : ""}`} onClick={closeNav} />
      <nav className={`mobile-nav${navOpen ? " open" : ""}`} aria-label="Menu" aria-hidden={!navOpen}>
        <div className="mn-head">
          <span className="brand-logo" role="img" aria-label="L&T" />
          <button className="dhead-close" onClick={closeNav} aria-label="Close menu"
            style={{ width: 38, height: 38, display: "grid", placeItems: "center" }}>
            <Close />
          </button>
        </div>
        <div className="mn-body">
          <form className="big-search" onSubmit={submit} role="search"
            style={{ display: "flex", maxWidth: "none", margin: "6px 12px 8px" }}>
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
            />
          </form>

          <div className="mn-sec">Account</div>
          {/* Account leads the drawer so wishlist and sign-in are visible
              without scrolling past every department. Browsing already has a
              Shop tab, so departments do not need the top slot. */}
          <Link href="/wishlist" onClick={closeNav}><Heart /> Wishlist</Link>
          {user ? (
            <>
              <Link href="/account" onClick={closeNav}><User /> {displayName}</Link>
              <Link href="/account?tab=orders" onClick={closeNav}><Package /> Orders</Link>
              <Link href="/account?tab=service" onClick={closeNav}><Shield /> Warranty &amp; service</Link>
              <button
                onClick={() => { closeNav(); signOut(); }}
                style={{ display: "flex", width: "100%", alignItems: "center", gap: 12, padding: 12, borderRadius: 8, fontSize: 15 }}
              >
                <LogOut /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={closeNav}><User /> Sign in</Link>
              <Link href="/login?mode=register&trade=1" onClick={closeNav}><Store /> Create trade account</Link>
            </>
          )}

          <div className="mn-sec">Departments</div>
          <Link href="/products" onClick={closeNav}>All departments</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={`/category/${c.id}`} onClick={closeNav}>
              {c.name}
            </Link>
          ))}

          <div className="mn-sec">Company</div>
          <Link href="/about" onClick={closeNav}>About L&T</Link>
          <Link href="/locations" onClick={closeNav}>Showrooms &amp; locations</Link>
          <Link href="/contact" onClick={closeNav}>Contact</Link>
        </div>
        <div className="mn-foot">
          Order by phone<br />
          <a href={telHref(COMPANY.mainPhone)}><b>{COMPANY.mainPhone}</b></a>
        </div>
      </nav>
    </>
  );
}
