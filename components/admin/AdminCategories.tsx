"use client";

import { useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { logAudit } from "@/lib/audit";
import { useStore } from "../StoreProvider";
import { useAuth } from "../AuthProvider";
import { Plus, Trash } from "../icons";

export type CategoryRow = { id: string; name: string; art: string; blurb: string | null; count: string | null; sort: number };

const ART_KEYS = ["range", "fridge", "fryer", "table", "rice", "wok", "lamp", "sink", "oven", "rack"];
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

export default function AdminCategories({
  categories, productCounts, onChanged,
}: {
  categories: CategoryRow[];
  productCounts: Record<string, number>;
  onChanged: () => void;
}) {
  const { toast } = useStore();
  const { user } = useAuth();
  const [rows, setRows] = useState<CategoryRow[]>(categories);
  const [orig] = useState<Record<string, CategoryRow>>(() => Object.fromEntries(categories.map((c) => [c.id, { ...c }])));
  const [saving, setSaving] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<CategoryRow>({ id: "", name: "", art: "range", blurb: "", count: "", sort: (categories.at(-1)?.sort ?? 0) + 1 });

  const edit = (id: string, patch: Partial<CategoryRow>) => setRows((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const dirty = (c: CategoryRow) => {
    const o = orig[c.id];
    return !o || o.name !== c.name || o.art !== c.art || (o.blurb ?? "") !== (c.blurb ?? "") || (o.count ?? "") !== (c.count ?? "") || o.sort !== c.sort;
  };

  const save = async (c: CategoryRow) => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    setSaving(c.id);
    const { error } = await sb.from("categories").update({ name: c.name, art: c.art, blurb: c.blurb || null, count: c.count || null, sort: c.sort }).eq("id", c.id);
    setSaving(null);
    if (error) return toast(error.message);
    orig[c.id] = { ...c };
    logAudit(user, "category.update", c.name, `Edited category`);
    toast(`${c.name} saved`);
    onChanged();
  };

  const remove = async (c: CategoryRow) => {
    if ((productCounts[c.id] ?? 0) > 0) return toast(`Move or delete its ${productCounts[c.id]} products first.`);
    if (!window.confirm(`Delete category “${c.name}”? This cannot be undone.`)) return;
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { error } = await sb.from("categories").delete().eq("id", c.id);
    if (error) return toast(error.message);
    setRows((p) => p.filter((x) => x.id !== c.id));
    logAudit(user, "category.delete", c.name, "Deleted category");
    toast(`${c.name} deleted`);
    onChanged();
  };

  const create = async () => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const id = slugify(draft.id || draft.name);
    if (!id) return toast("Category id/name required");
    if (rows.some((c) => c.id === id)) return toast("That id already exists");
    setSaving("__new");
    const row = { id, name: draft.name.trim() || id, art: draft.art, blurb: draft.blurb || null, count: draft.count || null, sort: Number(draft.sort) || 0 };
    const { error } = await sb.from("categories").insert(row);
    setSaving(null);
    if (error) return toast(error.message);
    setRows((p) => [...p, { ...row }].sort((a, b) => a.sort - b.sort));
    orig[id] = { ...row };
    logAudit(user, "category.create", row.name, "Created category");
    toast(`${row.name} created`);
    setAdding(false);
    setDraft({ id: "", name: "", art: "range", blurb: "", count: "", sort: (rows.at(-1)?.sort ?? 0) + 2 });
    onChanged();
  };

  const sorted = useMemo(() => [...rows].sort((a, b) => a.sort - b.sort), [rows]);

  return (
    <>
      <div className="admin-sec-head">
        <p className="admin-sub" style={{ margin: 0 }}>Departments shown across the storefront. Edits publish in real time.</p>
        <button className="btn btn-primary btn-sm" onClick={() => setAdding((v) => !v)}><Plus /> Add category</button>
      </div>

      {adding && (
        <div className="cat-add">
          <div className="pe-grid">
            <label className="pe-f"><span>Name *</span><input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Wok Ranges" /></label>
            <label className="pe-f"><span>Id{draft.id ? "" : " · auto from name"}</span><input value={draft.id} onChange={(e) => setDraft((d) => ({ ...d, id: e.target.value }))} placeholder="wok-range" /></label>
            <label className="pe-f"><span>Label</span><input value={draft.count ?? ""} onChange={(e) => setDraft((d) => ({ ...d, count: e.target.value }))} placeholder="Signature series" /></label>
            <label className="pe-f"><span>Illustration</span>
              <select value={draft.art} onChange={(e) => setDraft((d) => ({ ...d, art: e.target.value }))}>{ART_KEYS.map((a) => <option key={a} value={a}>{a}</option>)}</select>
            </label>
            <label className="pe-f"><span>Sort</span><input type="number" value={draft.sort} onChange={(e) => setDraft((d) => ({ ...d, sort: Number(e.target.value) }))} /></label>
          </div>
          <label className="pe-f"><span>Blurb</span><textarea rows={2} value={draft.blurb ?? ""} onChange={(e) => setDraft((d) => ({ ...d, blurb: e.target.value }))} placeholder="Short department description." /></label>
          <div className="cat-add-actions">
            <button className="btn btn-line btn-sm" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={create} disabled={saving === "__new"}>{saving === "__new" ? "Creating…" : "Create category"}</button>
          </div>
        </div>
      )}

      <div className="cat-list">
        {sorted.map((c) => {
          const count = productCounts[c.id] ?? 0;
          const d = dirty(c);
          return (
            <div className={`cat-row${d ? " dirty" : ""}`} key={c.id}>
              <div className="cat-id"><code>{c.id}</code><span>{count} product{count === 1 ? "" : "s"}</span></div>
              <label className="pe-f"><span>Name</span><input value={c.name} onChange={(e) => edit(c.id, { name: e.target.value })} /></label>
              <label className="pe-f"><span>Label</span><input value={c.count ?? ""} onChange={(e) => edit(c.id, { count: e.target.value })} /></label>
              <label className="pe-f cat-art"><span>Art</span>
                <select value={c.art} onChange={(e) => edit(c.id, { art: e.target.value })}>{ART_KEYS.map((a) => <option key={a} value={a}>{a}</option>)}</select>
              </label>
              <label className="pe-f cat-sort"><span>Sort</span><input type="number" value={c.sort} onChange={(e) => edit(c.id, { sort: Number(e.target.value) })} /></label>
              <div className="cat-row-actions">
                <button className={`btn btn-sm${d ? " btn-primary" : " btn-line"}`} disabled={!d || saving === c.id} onClick={() => save(c)}>{saving === c.id ? "…" : d ? "Save" : "Saved"}</button>
                <button className="cat-del" title={count > 0 ? "Has products" : "Delete"} onClick={() => remove(c)} aria-label="Delete category"><Trash /></button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
