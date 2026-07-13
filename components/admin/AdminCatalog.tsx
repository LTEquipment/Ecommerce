"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "../StoreProvider";
import { useAuth } from "../AuthProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { logAudit } from "@/lib/audit";
import { money } from "@/lib/format";
import { Search, Plus, Pencil, Trash } from "../icons";
import ProductEditor, { emptyProduct, type ProductRow, type CatOption } from "./ProductEditor";
import AdminCategories, { type CategoryRow } from "./AdminCategories";

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToProduct(r: any): ProductRow {
  return {
    slug: r.slug, sku: r.sku, name: r.name, category_id: r.category_id ?? null,
    art: r.art ?? "range", brand: r.brand ?? "", description: r.description ?? "",
    price: Number(r.price), was_price: r.was_price != null ? Number(r.was_price) : null,
    images: r.images ?? [], specs: r.specs ?? {}, documents: Array.isArray(r.documents) ? r.documents : [], rating: Number(r.rating ?? 4.7), reviews: r.reviews ?? 0,
    badge: r.badge ?? "", stock: r.stock ?? "in",
    stock_qty: r.stock_qty ?? 0, low_stock: r.low_stock ?? 5, sort: r.sort ?? 0,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function AdminCatalog() {
  const { toast } = useStore();
  const { user } = useAuth();
  const [view, setView] = useState<"products" | "categories">("products");
  const [rows, setRows] = useState<ProductRow[] | null>(null);
  const [cats, setCats] = useState<CategoryRow[]>([]);
  const [invEnabled, setInvEnabled] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<{ row: ProductRow; isNew: boolean } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const [{ data: prod }, { data: cat }] = await Promise.all([
      sb.from("products").select("*").order("sort"),
      sb.from("categories").select("id,name,art,blurb,count,sort").order("sort"),
    ]);
    setInvEnabled(Boolean(prod?.length) && "stock_qty" in (prod![0] as object));
    setRows((prod ?? []).map(rowToProduct));
    setCats((cat ?? []).map((c) => ({ id: c.id, name: c.name, art: c.art, blurb: c.blurb, count: c.count == null ? null : String(c.count), sort: c.sort })) as CategoryRow[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  const catName = useMemo(() => Object.fromEntries(cats.map((c) => [c.id, c.name])), [cats]);
  const catOptions: CatOption[] = useMemo(() => cats.map((c) => ({ id: c.id, name: c.name })), [cats]);
  const productCounts = useMemo(() => {
    const m: Record<string, number> = {};
    (rows ?? []).forEach((r) => { if (r.category_id) m[r.category_id] = (m[r.category_id] ?? 0) + 1; });
    return m;
  }, [rows]);

  const remove = async (r: ProductRow) => {
    if (!window.confirm(`Delete “${r.name}” (${r.sku})? This removes it from the storefront and cannot be undone.`)) return;
    const sb = getBrowserSupabase();
    if (!sb) return;
    setDeleting(r.slug);
    const { error } = await sb.from("products").delete().eq("slug", r.slug);
    setDeleting(null);
    if (error) return toast(error.message);
    setRows((p) => p?.filter((x) => x.slug !== r.slug) ?? p);
    logAudit(user, "product.delete", r.sku, `Deleted “${r.name.slice(0, 40)}”`);
    toast(`${r.sku} deleted`);
  };

  const filtered = useMemo(() => {
    if (!rows) return null;
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(s) || r.sku.toLowerCase().includes(s));
  }, [rows, q]);

  const nextSort = (rows?.reduce((m, r) => Math.max(m, r.sort), 0) ?? 0) + 1;

  return (
    <>
      <div className="admin-seg" role="tablist">
        <button role="tab" className={view === "products" ? "on" : ""} onClick={() => setView("products")}>Products <span>{rows?.length ?? "·"}</span></button>
        <button role="tab" className={view === "categories" ? "on" : ""} onClick={() => setView("categories")}>Categories <span>{cats.length || "·"}</span></button>
      </div>

      {view === "categories" ? (
        <AdminCategories categories={cats} productCounts={productCounts} onChanged={load} />
      ) : (
        <>
          <div className="admin-sec-head">
            <button className="btn btn-primary btn-sm" onClick={() => setEditing({ row: emptyProduct(nextSort), isNew: true })}><Plus /> Add product</button>
            <span className="admin-search">
              <Search />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" aria-label="Search products" />
            </span>
          </div>

          {!invEnabled && rows && rows.length > 0 && (
            <p className="pe-hint" style={{ marginTop: 0 }}>Run <code>supabase/admin-catalog.sql</code> to enable stock quantities &amp; low-stock alerts.</p>
          )}

          {filtered === null ? (
            <div>{[0, 1, 2, 3].map((i) => <div key={i} className="skel skel-row" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="emptybox"><Search /><div className="m">No products{q ? ` match “${q}”` : " yet"}</div></div>
          ) : (
            <div className="prod-list">
              {filtered.map((r) => {
                const low = invEnabled && r.stock_qty > 0 && r.stock_qty <= r.low_stock;
                const out = invEnabled && r.stock_qty <= 0;
                return (
                  <div className="prod-row" key={r.slug}>
                    <div className="prod-thumb">{r.images[0] ? <img src={r.images[0]} alt="" /> : <span className="prod-noimg" />}</div>
                    <div className="prod-id">
                      <div className="prod-sku">{r.sku}{r.badge && <em className={`tag ${r.badge === "Sale" ? "sale" : "new"}`}>{r.badge}</em>}</div>
                      <Link href={`/products/${r.slug}`} target="_blank">{r.name}</Link>
                      <span className="prod-cat">{r.category_id ? catName[r.category_id] ?? r.category_id : "Uncategorized"}</span>
                    </div>
                    <div className="prod-price">{money(r.price)}{r.was_price ? <s>{money(r.was_price)}</s> : null}</div>
                    <div className="prod-stock">
                      <span className={`pill ${out ? "mut" : r.stock === "in" ? "ok" : "warn"}`}>{r.stock === "in" ? "In stock" : "Backorder"}</span>
                      {invEnabled && (
                        <span className={`prod-qty${low ? " low" : ""}${out ? " out" : ""}`}>
                          {out ? "0 · out" : `${r.stock_qty} on hand${low ? " · low" : ""}`}
                        </span>
                      )}
                    </div>
                    <div className="prod-actions">
                      <button className="prod-btn" onClick={() => setEditing({ row: r, isNew: false })}><Pencil /> Edit</button>
                      <button className="prod-btn danger" disabled={deleting === r.slug} onClick={() => remove(r)} aria-label={`Delete ${r.sku}`}><Trash /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {editing && (
        <ProductEditor
          initial={editing.row}
          categories={catOptions}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </>
  );
}
