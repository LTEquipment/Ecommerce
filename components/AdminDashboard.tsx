"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useStore } from "./StoreProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { money } from "@/lib/format";

type Row = {
  slug: string;
  sku: string;
  name: string;
  image: string | null;
  price: number;
  badge: string;
  stock: string;
};

export default function AdminDashboard() {
  const { user, loading, configured, isAdmin } = useAuth();
  const { toast } = useStore();
  const router = useRouter();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && configured && !user) router.replace("/login?next=/admin");
  }, [loading, configured, user, router]);

  const load = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { data } = await sb
      .from("products")
      .select("slug, sku, name, images, price, badge, stock")
      .order("sort");
    setRows(
      (data ?? []).map((r) => ({
        slug: r.slug,
        sku: r.sku,
        name: r.name,
        image: r.images?.[0] ?? null,
        price: Number(r.price),
        badge: r.badge ?? "",
        stock: r.stock ?? "in",
      }))
    );
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const edit = (slug: string, patch: Partial<Row>) =>
    setRows((prev) => prev?.map((r) => (r.slug === slug ? { ...r, ...patch } : r)) ?? prev);

  const save = async (row: Row) => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    setSaving(row.slug);
    const { error } = await sb
      .from("products")
      .update({ price: row.price, badge: row.badge, stock: row.stock })
      .eq("slug", row.slug);
    setSaving(null);
    toast(error ? `Save failed: ${error.message}` : `${row.sku} updated · live now`);
  };

  if (!configured) {
    return (
      <div className="wrap">
        <div className="auth"><div className="card">
          <h1>Admin</h1>
          <div className="msg info">Connect Supabase (add keys to <b>.env.local</b>) to use the admin panel.</div>
          <Link className="btn btn-line btn-block" href="/">Back to home</Link>
        </div></div>
      </div>
    );
  }
  if (loading || !user) {
    return <div className="wrap" style={{ padding: "var(--s7) 0", color: "var(--muted)" }}>Loading…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="wrap">
        <div className="auth"><div className="card">
          <h1>Not authorized</h1>
          <p className="sub">Your account isn&apos;t an admin.</p>
          <div className="msg info">
            Grant access in Supabase SQL:
            <br />
            <code style={{ fontSize: 12 }}>insert into admins (user_id) select id from auth.users where email = &apos;{user.email}&apos;;</code>
          </div>
          <Link className="btn btn-line btn-block" href="/account">Go to account</Link>
        </div></div>
      </div>
    );
  }

  return (
    <div className="wrap content">
      <div className="lede-head" style={{ marginBottom: "var(--s5)" }}>
        <span className="eyebrow">Admin · live catalog</span>
        <h1>Catalog control</h1>
        <p>Edit price, badge and stock — saving pushes the change to the storefront in real time.</p>
      </div>

      {rows === null ? (
        <p style={{ color: "var(--muted)" }}>Loading products…</p>
      ) : (
        <div className="admin-list">
          {rows.map((r) => (
            <div className="admin-row" key={r.slug}>
              <div className="ar-thumb">{r.image ? <img src={r.image} alt="" /> : null}</div>
              <div className="ar-name">
                <div className="ar-sku">{r.sku}</div>
                <Link href={`/products/${r.slug}`}>{r.name}</Link>
              </div>
              <label className="ar-field">
                <span>Price</span>
                <input
                  type="number"
                  value={r.price}
                  onChange={(e) => edit(r.slug, { price: Number(e.target.value) })}
                />
              </label>
              <label className="ar-field">
                <span>Badge</span>
                <select value={r.badge} onChange={(e) => edit(r.slug, { badge: e.target.value })}>
                  <option value="">None</option>
                  <option value="Sale">Sale</option>
                  <option value="New">New</option>
                </select>
              </label>
              <label className="ar-field">
                <span>Stock</span>
                <select value={r.stock} onChange={(e) => edit(r.slug, { stock: e.target.value })}>
                  <option value="in">In stock</option>
                  <option value="back">Backorder</option>
                </select>
              </label>
              <button className="btn btn-primary" disabled={saving === r.slug} onClick={() => save(r)}>
                {saving === r.slug ? "Saving…" : "Save"}
              </button>
              <div className="ar-preview">{money(r.price)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
