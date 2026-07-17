"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { useAuth } from "./AuthProvider";
import { useStore } from "./StoreProvider";
import { PRODUCTS } from "@/lib/products";
import { money } from "@/lib/format";
import type { SavedList } from "@/lib/lists";

const BY_SKU = new Map(PRODUCTS.map((p) => [p.sku, p]));

type ListWithItems = SavedList & { items: string[] };

/** Manage account-synced project lists in the account. */
export default function ProjectLists() {
  const { user } = useAuth();
  const { add, openCart, toast } = useStore();
  const [lists, setLists] = useState<ListWithItems[] | null>(null);
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb || !user) return;
    const { data: ls } = await sb.from("saved_lists").select("id,name,created_at").order("created_at", { ascending: false });
    const rows = (ls as SavedList[]) ?? [];
    if (rows.length === 0) return setLists([]);
    const { data: items } = await sb.from("saved_list_items").select("list_id,sku");
    const bySku: Record<string, string[]> = {};
    (items ?? []).forEach((r) => {
      const row = r as { list_id: string; sku: string };
      (bySku[row.list_id] ??= []).push(row.sku);
    });
    setLists(rows.map((l) => ({ ...l, items: bySku[l.id] ?? [] })));
  }, [user]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const createList = async () => {
    const sb = getBrowserSupabase();
    if (!sb || !user || !newName.trim()) return;
    const { error } = await sb.from("saved_lists").insert({ user_id: user.id, name: newName.trim() });
    if (error) return toast(error.message || "Couldn’t create the list — try again", "error"); // keep the typed name
    setNewName("");
    load();
  };
  const delList = async (id: string) => {
    if (!window.confirm("Delete this list?")) return;
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { error } = await sb.from("saved_lists").delete().eq("id", id);
    if (error) return toast(error.message || "Couldn’t delete the list", "error");
    load();
  };
  const removeItem = async (listId: string, sku: string) => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { error } = await sb.from("saved_list_items").delete().eq("list_id", listId).eq("sku", sku);
    if (error) return toast(error.message || "Couldn’t remove the item", "error");
    load();
  };
  const addAll = (list: ListWithItems) => {
    let n = 0;
    for (const sku of list.items) {
      const p = BY_SKU.get(sku);
      if (p) { add(p); n++; }
    }
    if (n) { openCart(); toast(`Added ${n} item${n > 1 ? "s" : ""} to cart`); }
    else toast("These items are no longer available.");
  };

  if (!user) return null;

  return (
    <div className="addr-book">
      <div className="addr-head"><h3>Project lists</h3></div>
      <div className="stl-new" style={{ maxWidth: 380, marginBottom: "var(--s3)" }}>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New list (e.g. Downtown buildout)" onKeyDown={(e) => { if (e.key === "Enter") createList(); }} />
        <button className="btn btn-line" disabled={!newName.trim()} onClick={createList}>Create</button>
      </div>
      {lists === null ? (
        <div className="skel skel-row" />
      ) : lists.length === 0 ? (
        <p className="note" style={{ marginTop: 0 }}>No lists yet — create one above, then add products from any product page.</p>
      ) : (
        <div className="pl-list">
          {lists.map((l) => {
            const isOpen = open === l.id;
            return (
              <div className="pl-card" key={l.id}>
                <div className="pl-head">
                  <button className="pl-name" onClick={() => setOpen(isOpen ? null : l.id)}>
                    {l.name} <span>({l.items.length})</span>
                  </button>
                  <div className="pl-actions">
                    {l.items.length > 0 && <button onClick={() => addAll(l)}>Add all to cart</button>}
                    <button className="pl-del" onClick={() => delList(l.id)}>Delete</button>
                  </div>
                </div>
                {isOpen && (
                  <div className="pl-items">
                    {l.items.length === 0 ? (
                      <p className="note" style={{ margin: 0 }}>Empty — add products from any product page.</p>
                    ) : (
                      l.items.map((sku) => {
                        const p = BY_SKU.get(sku);
                        return (
                          <div className="pl-item" key={sku}>
                            {p ? <Link href={`/products/${p.slug}`}>{p.name}</Link> : <span>{sku} (unavailable)</span>}
                            <div className="pl-item-r">
                              {p && <span>{money(p.price)}</span>}
                              <button onClick={() => removeItem(l.id, sku)} aria-label="Remove">×</button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
