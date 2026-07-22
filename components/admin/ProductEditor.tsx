"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { logAudit } from "@/lib/audit";
import { useStore } from "../StoreProvider";
import { useDialog } from "@/lib/useDialog";
import { useAuth } from "../AuthProvider";
import { money } from "@/lib/format";
import { safeHref } from "@/lib/safeHref";
import { Close, Plus, Trash, Image as ImageIcon, Star } from "../icons";
import type { ArtKey, ProductDoc } from "@/lib/types";

export type ProductRow = {
  slug: string;
  sku: string;
  name: string;
  category_id: string | null;
  art: string;
  brand: string | null;
  description: string | null;
  price: number;
  was_price: number | null;
  images: string[];
  specs: Record<string, string>;
  documents: ProductDoc[];
  rating: number;
  reviews: number;
  badge: string;
  stock: string;
  stock_qty: number;
  low_stock: number;
  /** Does anyone count this? Carried from the ERP; gates the low-stock alert. */
  stock_tracked: boolean;
  sort: number;
};

export type CatOption = { id: string; name: string };

const ART_KEYS: ArtKey[] = ["range", "fridge", "fryer", "table", "rice", "wok", "lamp", "sink", "oven", "rack"];
const DOC_PRESETS = ["Spec sheet", "Manual", "Warranty", "Elevation chart", "Brochure", "Compatibility"];

export function emptyProduct(sort = 0): ProductRow {
  return {
    slug: "", sku: "", name: "", category_id: null, art: "range", brand: "", description: "",
    price: 0, was_price: null, images: [], specs: {}, documents: [], rating: 4.7, reviews: 0,
    badge: "", stock: "in", stock_qty: 0, low_stock: 5, stock_tracked: false, sort,
  };
}

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

export default function ProductEditor({
  initial, categories, isNew, onClose, onSaved,
}: {
  initial: ProductRow;
  categories: CatOption[];
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useStore();
  const { user } = useAuth();
  const [p, setP] = useState<ProductRow>(initial);
  const [specs, setSpecs] = useState<[string, string][]>(Object.entries(initial.specs ?? {}));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const [pendingLabel, setPendingLabel] = useState("");
  const [docUploading, setDocUploading] = useState(false);

  const set = <K extends keyof ProductRow>(k: K, v: ProductRow[K]) => setP((prev) => ({ ...prev, [k]: v }));

  // Unsaved-changes guard: warn before discarding an edited form.
  const dirty = useMemo(() => {
    const specObj = Object.fromEntries(specs.filter(([k]) => k.trim()).map(([k, v]) => [k.trim(), v]));
    const cur = JSON.stringify({ ...p, specs: undefined });
    const orig = JSON.stringify({ ...initial, specs: undefined });
    return cur !== orig || JSON.stringify(specObj) !== JSON.stringify(initial.specs ?? {});
  }, [p, specs, initial]);
  const requestClose = useCallback(() => {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    onClose();
  }, [dirty, onClose]);

  // Dialog behaviour via the shared hook: focus in, Tab trapped, Escape to
  // close (through requestClose, so the unsaved-changes guard still runs),
  // focus restored, body scroll locked. This component only mounts while open.
  // It previously hand-rolled the lock and Escape but never managed focus, so
  // Tab walked straight out of a modal declaring aria-modal="true".
  const dialogRef = useDialog<HTMLDivElement>(true, requestClose);

  const addSpec = () => setSpecs((s) => [...s, ["", ""]]);
  const editSpec = (i: number, which: 0 | 1, val: string) =>
    setSpecs((s) => s.map((row, j) => (j === i ? (which === 0 ? [val, row[1]] : [row[0], val]) : row)));
  const removeSpec = (i: number) => setSpecs((s) => s.filter((_, j) => j !== i));

  const upload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", p.slug || p.sku || "misc");
    const res = await fetch("/api/admin/product-image", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) return toast(json.error || "Upload failed", "error");
    // Functional update: read the freshest images inside setP, not the stale
    // closure captured before this async upload started.
    setP((prev) => ({ ...prev, images: [...prev.images, json.url as string] }));
  };
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) upload(f);
    e.target.value = "";
  };
  const addUrl = () => {
    const url = window.prompt("Paste an image URL or a /products/… path:");
    if (!url || !url.trim()) return;
    const safe = safeHref(url.trim());
    if (!safe) return toast("That URL isn’t allowed (use http(s):// or a /path).", "error");
    set("images", [...p.images, safe]);
  };
  const removeImg = (i: number) => set("images", p.images.filter((_, j) => j !== i));
  const makePrimary = (i: number) => set("images", [p.images[i], ...p.images.filter((_, j) => j !== i)]);

  // Documents
  const pickDoc = (label: string) => { setPendingLabel(label); docRef.current?.click(); };
  const onDocPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setDocUploading(true);
    const fd = new FormData();
    fd.append("file", f);
    fd.append("slug", p.slug || p.sku || "misc");
    const res = await fetch("/api/admin/product-doc", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    setDocUploading(false);
    if (!res.ok) { toast(json.error || "Upload failed", "error"); return; }
    // Functional update so a concurrent document edit isn't clobbered by this
    // async upload's stale closure.
    setP((prev) => ({ ...prev, documents: [...(prev.documents ?? []), { label: pendingLabel || f.name.replace(/\.[^.]+$/, ""), url: json.url as string }] }));
    setPendingLabel("");
  };
  const editDocLabel = (i: number, label: string) => set("documents", (p.documents ?? []).map((x, j) => (j === i ? { ...x, label } : x)));
  const removeDoc = (i: number) => set("documents", (p.documents ?? []).filter((_, j) => j !== i));
  const addDocUrl = () => {
    const label = window.prompt("Document label (e.g. Manual):"); if (!label) return;
    const url = window.prompt("Document URL:"); if (!url) return;
    const safe = safeHref(url.trim());
    if (!safe) return toast("That URL isn’t allowed (use http(s):// or a /path).", "error");
    set("documents", [...(p.documents ?? []), { label: label.trim(), url: safe }]);
  };

  const save = async () => {
    const sb = getBrowserSupabase();
    if (!sb) return toast("Backend not connected", "error");
    const slug = isNew ? slugify(p.slug || p.sku) : p.slug;
    if (!p.name.trim()) return toast("Name is required", "error");
    if (!p.sku.trim()) return toast("SKU is required", "error");
    if (!slug) return toast("Slug is required", "error");
    if (!(p.price >= 0)) return toast("Price must be a number", "error");

    // Products are identified by SKU across the list, audit and delete-confirm —
    // block a duplicate that belongs to a different product.
    const { data: dupe } = await sb.from("products").select("slug").eq("sku", p.sku.trim()).neq("slug", slug).limit(1);
    if (dupe && dupe.length > 0) return toast(`SKU ${p.sku.trim()} is already used by another product.`, "error");

    const specObj = Object.fromEntries(specs.filter(([k]) => k.trim()).map(([k, v]) => [k.trim(), v]));
    const row = {
      slug, sku: p.sku.trim(), name: p.name.trim(), category_id: p.category_id || null,
      art: p.art || "range", brand: p.brand?.trim() || null, description: p.description?.trim() || null,
      price: Number(p.price), was_price: p.was_price != null && p.was_price !== 0 ? Number(p.was_price) : null,
      images: p.images, specs: specObj, documents: p.documents ?? [], rating: Number.isFinite(Number(p.rating)) ? Number(p.rating) : 4.7, reviews: Number(p.reviews) || 0,
      badge: p.badge || "", stock: p.stock || "in", stock_qty: Number(p.stock_qty) || 0,
      low_stock: Number(p.low_stock) || 0, sort: Number(p.sort) || 0,
    };

    setSaving(true);
    let error;
    if (isNew) ({ error } = await sb.from("products").insert(row));
    else ({ error } = await sb.from("products").update(row).eq("slug", slug));
    setSaving(false);

    if (error) {
      // stock_qty/low_stock columns may not exist yet (migration not run) — retry without them.
      if (/stock_qty|low_stock|documents|column/.test(error.message)) {
        const safe = { ...row } as Record<string, unknown>;
        delete safe.stock_qty;
        delete safe.low_stock;
        delete safe.documents;
        const retry = isNew ? await sb.from("products").insert(safe) : await sb.from("products").update(safe).eq("slug", slug);
        if (retry.error) return toast(retry.error.message.includes("duplicate") ? "That slug already exists — pick another." : retry.error.message, "error");
        toast("Saved — run the migrations to enable stock quantities & documents.");
      } else {
        return toast(error.message.includes("duplicate") ? "That slug already exists — pick another." : error.message, "error");
      }
    } else {
      toast(isNew ? `${row.sku} added · live now` : `${row.sku} updated · live now`);
    }
    logAudit(user, isNew ? "product.create" : "product.update", row.sku, isNew ? `Added “${row.name.slice(0, 40)}”` : `Edited · ${money(row.price)}`);
    onSaved();
  };

  return (
    <div className="pe-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) requestClose(); }}>
      <div className="pe-modal" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={isNew ? "Add product" : "Edit product"}>
        <header className="pe-head">
          <h2>{isNew ? "Add product" : "Edit product"}</h2>
          <button className="pe-x" onClick={requestClose} aria-label="Close"><Close /></button>
        </header>

        <div className="pe-body">
          {/* Identity */}
          <section className="pe-sec">
            <h3>Basics</h3>
            <div className="pe-grid">
              <label className="pe-f pe-col2"><span>Product name *</span>
                <input autoFocus value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Turbo Wok Range — 1 Burner" />
              </label>
              <label className="pe-f"><span>SKU / model *</span>
                <input value={p.sku} onChange={(e) => set("sku", e.target.value)} placeholder="52527" />
              </label>
              <label className="pe-f"><span>Slug (URL id){isNew ? "" : " · locked"}</span>
                <input value={p.slug} disabled={!isNew} onChange={(e) => set("slug", e.target.value)} placeholder="auto from SKU" />
              </label>
              <label className="pe-f"><span>Category</span>
                <select value={p.category_id ?? ""} onChange={(e) => set("category_id", e.target.value || null)}>
                  <option value="">— none —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className="pe-f"><span>Brand</span>
                <input value={p.brand ?? ""} onChange={(e) => set("brand", e.target.value)} placeholder="Panda®" />
              </label>
            </div>
            <label className="pe-f"><span>Description</span>
              <textarea rows={3} value={p.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="Short marketing description shown on the product page." />
            </label>
          </section>

          {/* Pricing */}
          <section className="pe-sec">
            <h3>Pricing &amp; badge</h3>
            <div className="pe-grid">
              <label className="pe-f"><span>Price (USD) *</span>
                <input type="number" min="0" step="0.01" value={p.price} onChange={(e) => set("price", Number(e.target.value))} />
              </label>
              <label className="pe-f"><span>Was price (strike)</span>
                <input type="number" min="0" step="0.01" value={p.was_price ?? ""} onChange={(e) => set("was_price", e.target.value === "" ? null : Number(e.target.value))} placeholder="optional" />
              </label>
              <label className="pe-f"><span>Badge</span>
                <select value={p.badge} onChange={(e) => set("badge", e.target.value)}>
                  <option value="">None</option><option value="Sale">Sale</option><option value="New">New</option>
                </select>
              </label>
            </div>
            {p.was_price != null && p.was_price !== 0 && p.was_price <= p.price && (
              <p className="pe-hint warn">“Was” price should be higher than the current price to show a discount.</p>
            )}
          </section>

          {/* Inventory */}
          <section className="pe-sec">
            <h3>Inventory</h3>
            <div className="pe-grid">
              <label className="pe-f"><span>Stock status</span>
                <select value={p.stock} onChange={(e) => set("stock", e.target.value)}>
                  <option value="in">In stock</option><option value="back">Backorder</option>
                </select>
              </label>
              <label className="pe-f"><span>Quantity on hand</span>
                <input type="number" min="0" step="1" value={p.stock_qty} onChange={(e) => set("stock_qty", Number(e.target.value))} />
              </label>
              <label className="pe-f"><span>Low-stock alert at</span>
                <input type="number" min="0" step="1" value={p.low_stock} onChange={(e) => set("low_stock", Number(e.target.value))} />
              </label>
            </div>
            {p.stock === "in" && p.stock_qty === 0 && (
              <p className="pe-hint warn">Marked in stock but quantity is 0 — consider Backorder or add quantity.</p>
            )}
          </section>

          {/* Images */}
          <section className="pe-sec">
            <h3>Photos <span className="pe-note">first photo is the primary image</span></h3>
            <div className="pe-imgs">
              {p.images.map((src, i) => (
                <div className={`pe-img${i === 0 ? " primary" : ""}`} key={src + i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading="lazy" decoding="async" />
                  {i === 0 && <span className="pe-primary-tag">Primary</span>}
                  <div className="pe-img-actions">
                    {i !== 0 && <button title="Set as primary" onClick={() => makePrimary(i)}><Star /></button>}
                    <button title="Remove" onClick={() => removeImg(i)}><Trash /></button>
                  </div>
                </div>
              ))}
              <button className="pe-img-add" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <ImageIcon />
                <span>{uploading ? "Uploading…" : "Upload"}</span>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
            <button className="pe-link" onClick={addUrl}>+ Add by URL / path</button>
          </section>

          {/* Documents */}
          <section className="pe-sec">
            <h3>Documents <span className="pe-note">PDFs &amp; downloads shown on the product page</span></h3>
            {(p.documents ?? []).length > 0 && (
              <div className="pe-docs">
                {(p.documents ?? []).map((d, i) => (
                  <div className="pe-doc-row" key={i}>
                    <input value={d.label} onChange={(e) => editDocLabel(i, e.target.value)} placeholder="Label" />
                    <a className="pe-doc-file" href={safeHref(d.url)} target="_blank" rel="noreferrer" title={d.url}>{d.url.split("/").pop()}</a>
                    <button className="pe-spec-x" onClick={() => removeDoc(i)} aria-label="Remove document"><Close /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="pe-doc-presets">
              {DOC_PRESETS.map((label) => (
                <button key={label} type="button" className="pe-preset" disabled={docUploading} onClick={() => pickDoc(label)}>+ {label}</button>
              ))}
              <button type="button" className="pe-preset" disabled={docUploading} onClick={() => pickDoc("")}>+ Other</button>
            </div>
            <input ref={docRef} type="file" accept=".pdf,application/pdf" hidden onChange={onDocPick} />
            <button className="pe-link" onClick={addDocUrl}>+ Add by URL</button>
            {docUploading && <span className="pe-hint" style={{ marginLeft: 10 }}>Uploading…</span>}
          </section>

          {/* Specs */}
          <section className="pe-sec">
            <h3>Spec sheet <span className="pe-note">key → value rows</span></h3>
            <div className="pe-specs">
              {specs.map(([k, v], i) => (
                <div className="pe-spec-row" key={i}>
                  <input value={k} onChange={(e) => editSpec(i, 0, e.target.value)} placeholder="Total BTU" />
                  <input value={v} onChange={(e) => editSpec(i, 1, e.target.value)} placeholder="125,000" />
                  <button className="pe-spec-x" onClick={() => removeSpec(i)} aria-label="Remove spec"><Close /></button>
                </div>
              ))}
              <button className="pe-link" onClick={addSpec}><Plus /> Add spec</button>
            </div>
          </section>

          {/* Advanced */}
          <section className="pe-sec">
            <h3>Display</h3>
            <div className="pe-grid">
              <label className="pe-f"><span>Fallback illustration</span>
                <select value={p.art} onChange={(e) => set("art", e.target.value)}>
                  {ART_KEYS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </label>
              <label className="pe-f"><span>Rating (0–5)</span>
                <input type="number" min="0" max="5" step="0.1" value={p.rating} onChange={(e) => set("rating", Number(e.target.value))} />
              </label>
              <label className="pe-f"><span>Review count</span>
                <input type="number" min="0" step="1" value={p.reviews} onChange={(e) => set("reviews", Number(e.target.value))} />
              </label>
              <label className="pe-f"><span>Sort order</span>
                <input type="number" step="1" value={p.sort} onChange={(e) => set("sort", Number(e.target.value))} />
              </label>
            </div>
          </section>
        </div>

        <footer className="pe-foot">
          <div className="pe-foot-preview">{p.name || "New product"} · <b>{money(Number(p.price) || 0)}</b></div>
          <div className="pe-foot-actions">
            <button className="btn btn-line" onClick={requestClose} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : isNew ? "Add product" : "Save changes"}</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
