"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "../StoreProvider";
import { useAuth } from "../AuthProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { logAudit } from "@/lib/audit";
import { money } from "@/lib/format";
import { Search } from "../icons";

type Row = { slug: string; sku: string; name: string; image: string | null; price: number; badge: string; stock: string };
type Orig = Record<string, { price: number; badge: string; stock: string }>;

export default function AdminCatalog() {
  const { toast } = useStore();
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [orig, setOrig] = useState<Orig>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { data } = await sb.from("products").select("slug, sku, name, images, price, badge, stock").order("sort");
    const mapped: Row[] = (data ?? []).map((r) => ({
      slug: r.slug, sku: r.sku, name: r.name, image: r.images?.[0] ?? null,
      price: Number(r.price), badge: r.badge ?? "", stock: r.stock ?? "in",
    }));
    setRows(mapped);
    setOrig(Object.fromEntries(mapped.map((r) => [r.slug, { price: r.price, badge: r.badge, stock: r.stock }])));
  }, []);
  useEffect(() => { load(); }, [load]);

  const edit = (slug: string, patch: Partial<Row>) =>
    setRows((prev) => prev?.map((r) => (r.slug === slug ? { ...r, ...patch } : r)) ?? prev);
  const isDirty = (r: Row) => {
    const o = orig[r.slug];
    return !o || o.price !== r.price || o.badge !== r.badge || o.stock !== r.stock;
  };
  const save = async (row: Row) => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    setSaving(row.slug);
    const { error } = await sb.from("products").update({ price: row.price, badge: row.badge, stock: row.stock }).eq("slug", row.slug);
    setSaving(null);
    if (error) return toast(`Save failed: ${error.message}`);
    setOrig((o) => ({ ...o, [row.slug]: { price: row.price, badge: row.badge, stock: row.stock } }));
    logAudit(user, "product.update", row.sku, `${money(row.price)} · ${row.badge || "no badge"} · ${row.stock === "in" ? "in stock" : "backorder"}`);
    toast(`${row.sku} updated · live now`);
  };

  const filtered = useMemo(() => {
    if (!rows) return null;
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(s) || r.sku.toLowerCase().includes(s));
  }, [rows, q]);

  return (
    <>
      <div className="admin-sec-head">
        <p className="admin-sub" style={{ margin: 0 }}>Edit price, badge and stock — saves push to the storefront in real time.</p>
        <span className="admin-search">
          <Search />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" aria-label="Search products" />
        </span>
      </div>

      {filtered === null ? (
        <div>{[0, 1, 2, 3].map((i) => <div key={i} className="skel skel-row" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="emptybox"><Search /><div className="m">No products match &ldquo;{q}&rdquo;</div></div>
      ) : (
        <div className="admin-list">
          {filtered.map((r) => {
            const dirty = isDirty(r);
            return (
              <div className={`admin-row${dirty ? " dirty" : ""}`} key={r.slug}>
                <div className="ar-thumb">{r.image ? <img src={r.image} alt="" /> : null}</div>
                <div className="ar-name">
                  <div className="ar-sku">{r.sku}</div>
                  <Link href={`/products/${r.slug}`}>{r.name}</Link>
                </div>
                <label className="ar-field"><span>Price</span>
                  <input type="number" value={r.price} onChange={(e) => edit(r.slug, { price: Number(e.target.value) })} />
                </label>
                <label className="ar-field"><span>Badge</span>
                  <select value={r.badge} onChange={(e) => edit(r.slug, { badge: e.target.value })}>
                    <option value="">None</option><option value="Sale">Sale</option><option value="New">New</option>
                  </select>
                </label>
                <label className="ar-field"><span>Stock</span>
                  <select value={r.stock} onChange={(e) => edit(r.slug, { stock: e.target.value })}>
                    <option value="in">In stock</option><option value="back">Backorder</option>
                  </select>
                </label>
                <button className={`btn${dirty ? " dirty" : ""}`} disabled={saving === r.slug || !dirty} onClick={() => save(r)}>
                  {saving === r.slug ? "Saving…" : dirty ? "Save" : "Saved"}
                </button>
                <div className="ar-preview">{money(r.price)}</div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
