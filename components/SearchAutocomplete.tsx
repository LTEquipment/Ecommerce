"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useStore } from "./StoreProvider";
import { money } from "@/lib/format";
import { Search } from "./icons";

type Suggestion =
  | { type: "product"; slug: string; name: string; sku: string; price: number; img?: string }
  | { type: "category"; id: string; name: string };

const MAX_PRODUCTS = 6;

// Public catalog read, same anon key the storefront already renders from.
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sb = SB_URL && SB_ANON ? createClient(SB_URL, SB_ANON, { auth: { persistSession: false } }) : null;

/** Header search with a live typeahead over the catalog (SKU-first for B2B). */
export default function SearchAutocomplete() {
  const { query, setQuery } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [items, setItems] = useState<Suggestion[]>([]);
  const rootRef = useRef<HTMLFormElement>(null);

  const q = query.trim().toLowerCase();

  // Queries the catalog itself rather than a bundled copy. Searching a
  // hard-coded list meant the header offered products that had been deleted and
  // missed every product added since the build — the results looked real and
  // were not.
  useEffect(() => {
    if (q.length < 2) { setItems([]); return; }
    if (!sb) { setItems([]); return; }

    let cancelled = false;
    // Debounced: this fires per keystroke.
    const t = setTimeout(async () => {
      const like = `%${q.replace(/[%_,]/g, "")}%`;
      const [prod, cat] = await Promise.all([
        sb.from("products")
          .select("slug,sku,name,price,images")
          .or(`name.ilike.${like},sku.ilike.${like},brand.ilike.${like}`)
          .limit(MAX_PRODUCTS),
        sb.from("categories").select("id,name").ilike("name", like).limit(3),
      ]);
      if (cancelled) return;
      const products: Suggestion[] = (prod.data ?? []).map((p) => ({
        type: "product",
        slug: p.slug as string,
        name: p.name as string,
        sku: p.sku as string,
        price: Number(p.price),
        img: (p.images as string[] | null)?.[0],
      }));
      const cats: Suggestion[] = (cat.data ?? []).map((c) => ({
        type: "category",
        id: c.id as string,
        name: c.name as string,
      }));
      setItems([...products, ...cats]);
    }, 180);

    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  const showDropdown = open && q.length >= 2;

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (s: Suggestion) => {
    setOpen(false);
    setActive(-1);
    router.push(s.type === "product" ? `/products/${s.slug}` : `/category/${s.id}`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (active >= 0 && items[active]) return go(items[active]);
    const term = query.trim();
    setOpen(false);
    router.push(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
  };

  const onKey = (e: React.KeyboardEvent) => {
    // Escape must work even on the "No matches" dropdown (items.length === 0).
    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (!showDropdown || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    }
  };

  return (
    <form
      ref={rootRef}
      className="big-search"
      onSubmit={submit}
      role="search"
      aria-expanded={showDropdown}
      aria-haspopup="listbox"
    >
      <Search />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        placeholder="Search products, models & categories…"
        aria-label="Search products"
        role="combobox"
        aria-controls="search-suggest"
        aria-autocomplete="list"
        autoComplete="off"
      />
      {showDropdown && (
        <div className="search-suggest" id="search-suggest" role="listbox" onMouseLeave={() => setActive(-1)}>
          {items.length === 0 ? (
            <div className="ss-empty">No matches — press Enter to search all equipment.</div>
          ) : (
            items.map((s, i) =>
              s.type === "product" ? (
                <button
                  type="button"
                  key={`p-${s.slug}`}
                  role="option"
                  aria-selected={i === active}
                  className={`ss-item${i === active ? " on" : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(s)}
                >
                  <span className="ss-thumb">{s.img ? <img src={s.img} alt="" loading="lazy" decoding="async" /> : null}</span>
                  <span className="ss-txt">
                    <span className="ss-name">{s.name}</span>
                    <span className="ss-sku">Model {s.sku}</span>
                  </span>
                  <span className="ss-price">{money(s.price)}</span>
                </button>
              ) : (
                <button
                  type="button"
                  key={`c-${s.id}`}
                  role="option"
                  aria-selected={i === active}
                  className={`ss-item${i === active ? " on" : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(s)}
                >
                  <span className="ss-thumb ss-cat-ic">
                    <Search />
                  </span>
                  <span className="ss-txt">
                    <span className="ss-name">{s.name}</span>
                    <span className="ss-sku">Department</span>
                  </span>
                </button>
              )
            )
          )}
        </div>
      )}
    </form>
  );
}
