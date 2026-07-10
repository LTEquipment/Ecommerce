"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/types";

type CartItem = { product: Product; qty: number };

type Store = {
  cart: Record<string, CartItem>;
  add: (p: Product, qty?: number) => void;
  changeQty: (sku: string, d: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;

  drawerOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  navOpen: boolean;
  openNav: () => void;
  closeNav: () => void;

  toastMsg: string | null;
  toast: (m: string) => void;

  query: string;
  setQuery: (q: string) => void;
  activeCat: string;
  setActiveCat: (c: string) => void;
  priceBracket: string;
  setPriceBracket: (p: string) => void;
  inStock: boolean;
  setInStock: (b: boolean) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  clearFilters: () => void;
};

const Ctx = createContext<Store | null>(null);
const CART_KEY = "lt-cart-v1";

export function useStore(): Store {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used within <StoreProvider>");
  return c;
}

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [priceBracket, setPriceBracket] = useState("all");
  const [inStock, setInStock] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // hydrate cart from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // persist cart after hydration
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* storage full / unavailable */
    }
  }, [cart, hydrated]);

  const toast = useCallback((m: string) => {
    setToastMsg(m);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2400);
  }, []);

  const add = useCallback(
    (p: Product, qty = 1) => {
      setCart((c) => ({
        ...c,
        [p.sku]: { product: p, qty: (c[p.sku]?.qty || 0) + qty },
      }));
      toast(`${p.sku} added to cart.`);
    },
    [toast]
  );

  const changeQty = useCallback((sku: string, d: number) => {
    setCart((c) => {
      const cur = c[sku];
      if (!cur) return c;
      const q = cur.qty + d;
      const next = { ...c };
      if (q <= 0) delete next[sku];
      else next[sku] = { ...cur, qty: q };
      return next;
    });
  }, []);

  const remove = useCallback((sku: string) => {
    setCart((c) => {
      const next = { ...c };
      delete next[sku];
      return next;
    });
  }, []);

  const clear = useCallback(() => setCart({}), []);

  const clearFilters = useCallback(() => {
    setActiveCat("all");
    setPriceBracket("all");
    setInStock(false);
    setQuery("");
  }, []);

  const count = useMemo(
    () => Object.values(cart).reduce((s, i) => s + i.qty, 0),
    [cart]
  );
  const subtotal = useMemo(
    () => Object.values(cart).reduce((s, i) => s + i.product.price * i.qty, 0),
    [cart]
  );

  const value: Store = {
    cart,
    add,
    changeQty,
    remove,
    clear,
    count,
    subtotal,
    drawerOpen,
    openCart: () => setDrawerOpen(true),
    closeCart: () => setDrawerOpen(false),
    navOpen,
    openNav: () => setNavOpen(true),
    closeNav: () => setNavOpen(false),
    toastMsg,
    toast,
    query,
    setQuery,
    activeCat,
    setActiveCat,
    priceBracket,
    setPriceBracket,
    inStock,
    setInStock,
    sortBy,
    setSortBy,
    clearFilters,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
