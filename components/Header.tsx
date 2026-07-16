"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "./StoreProvider";
import { useAuth } from "./AuthProvider";
import WishlistIcon from "./WishlistIcon";
import SearchAutocomplete from "./SearchAutocomplete";
import { money } from "@/lib/format";
import { COMPANY } from "@/lib/company";
import { CATEGORIES } from "@/lib/products";
import { ILLUS } from "@/lib/illus";
import { Search, User, UserRound, Bag, ShieldCheck, Grid, SignOut, Cart, Menu, ChevronDown, FileText } from "./icons";

const NAV = CATEGORIES.slice(0, 6);

export default function Header() {
  const { openCart, openNav, count, subtotal } = useStore();
  const { user, isAdmin, displayName, signOut } = useAuth();
  const avatarUrl = (user?.user_metadata?.avatar_url as string) || "";
  const acctInitial = displayName?.[0]?.toUpperCase() || "L";
  const [menuOpen, setMenuOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [deptPos, setDeptPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const acctRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);
  const deptBtnRef = useRef<HTMLButtonElement>(null);

  const toggleDept = () => {
    const next = !deptOpen;
    if (next && deptBtnRef.current) {
      const r = deptBtnRef.current.getBoundingClientRect();
      setDeptPos({ left: r.left, top: r.bottom + 4 });
    }
    setDeptOpen(next);
  };

  useEffect(() => {
    if (!deptOpen) return;
    const close = () => setDeptOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => { window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  }, [deptOpen]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) setDeptOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMenuOpen(false); setDeptOpen(false); }
    };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", esc); };
  }, []);

  return (
    <header>
      <div className="wrap hdr">
        <Link className="brand" href="/" aria-label="L&T — home">
          <span className="brand-logo" role="img" aria-label="L&T Restaurant Equipment" />
          <span className="wordmark">
            <b>Restaurant Equipment</b>
            <span>Made to inspire · NYC</span>
          </span>
        </Link>

        <SearchAutocomplete />

        <div className="hdr-actions">
          <Link className="qcta" href="/contact">
            <FileText /> Get a quote
          </Link>

          <span className="hdr-div" aria-hidden="true" />

          {/* desktop account */}
          {user ? (
            <div className={`acct-wrap hact acc${menuOpen ? " open" : ""}`} ref={acctRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                style={{ display: "flex", alignItems: "center", gap: 9 }}
              >
                <span className="acct-ava">
                  {avatarUrl ? <img src={avatarUrl} alt="" /> : acctInitial}
                </span>
                <span className="lbl">
                  <b>Account</b>
                  <span>{displayName}</span>
                </span>
                <ChevronDown className={`acct-chev${menuOpen ? " open" : ""}`} style={{ width: 15, height: 15 }} />
              </button>
              {menuOpen && (
                <div className="acct-menu" role="menu">
                  <div className="who">
                    <span className="ava">
                      {avatarUrl ? <img src={avatarUrl} alt="" /> : acctInitial}
                    </span>
                    <div className="who-txt">
                      <b title={displayName}>{displayName}</b>
                      <span title={user.email}>{user.email}</span>
                    </div>
                  </div>
                  <Link href="/account" role="menuitem" onClick={() => setMenuOpen(false)}>
                    <UserRound /> Account
                  </Link>
                  <Link href="/account?tab=orders" role="menuitem" onClick={() => setMenuOpen(false)}>
                    <Bag /> Orders
                  </Link>
                  <Link href="/account?tab=service" role="menuitem" onClick={() => setMenuOpen(false)}>
                    <ShieldCheck /> Warranty &amp; service
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" role="menuitem" onClick={() => setMenuOpen(false)}>
                      <Grid /> Admin
                    </Link>
                  )}
                  <div className="acct-menu-sep" role="separator" />
                  <button className="signout" role="menuitem" onClick={() => { setMenuOpen(false); signOut(); }}>
                    <SignOut /> Sign out
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

          {/* wishlist */}
          <WishlistIcon />

          {/* desktop cart (compact icon; total shown in the cart drawer) */}
          <button className="hact hdr-cart" onClick={openCart} aria-label={`Open cart (${money(subtotal)})`} title={`Cart · ${money(subtotal)}`}>
            <Cart />
            {count > 0 && <span className="cart-count">{count}</span>}
          </button>

          {/* mobile icon bar */}
          <button className="icon-btn" onClick={openNav} aria-label="Search">
            <Search />
          </button>
          <Link className="icon-btn" href={user ? "/account" : "/login"} aria-label="Account">
            <User />
          </Link>
          <button className="icon-btn hdr-cart" onClick={openCart} aria-label="Open cart">
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
          <div className="all-wrap" ref={deptRef}>
            <button
              ref={deptBtnRef}
              className={`all${deptOpen ? " open" : ""}`}
              onClick={toggleDept}
              aria-haspopup="true"
              aria-expanded={deptOpen}
            >
              <Menu style={{ width: 16, height: 16 }} />
              All Departments
              <ChevronDown style={{ width: 14, height: 14 }} />
            </button>
            {deptOpen && (
              <div className="dept-menu" role="menu" style={{ left: deptPos.left, top: deptPos.top }}>
                {CATEGORIES.map((c) => (
                  <Link key={c.id} href={`/category/${c.id}`} className="dept-mi" role="menuitem" onClick={() => setDeptOpen(false)}>
                    <span className="dmi-ic" dangerouslySetInnerHTML={{ __html: ILLUS[c.art] }} />
                    <span className="dmi-t"><b>{c.name}</b><span>{c.count}</span></span>
                  </Link>
                ))}
                <Link href="/products" className="dept-all" onClick={() => setDeptOpen(false)}>
                  View all equipment →
                </Link>
              </div>
            )}
          </div>
          {NAV.map((c) => (
            <Link key={c.id} href={`/category/${c.id}`}>
              {c.name}
            </Link>
          ))}
          <Link href="/locations">Locations</Link>
        </div>
      </div>
    </header>
  );
}
