"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { useAuth } from "./AuthProvider";
import { useStore } from "./StoreProvider";
import { List } from "./icons";
import type { SavedList } from "@/lib/lists";
import type { Product } from "@/lib/types";

/** PDP control: add a product to one or more account-synced project lists. */
export default function SaveToList({ p }: { p: Product }) {
  const { user, configured } = useAuth();
  const { toast } = useStore();
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<SavedList[]>([]);
  const [inSet, setInSet] = useState<Set<string>>(new Set());
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb || !user) return;
    const [{ data: l }, { data: items }] = await Promise.all([
      sb.from("saved_lists").select("id,name,created_at").order("created_at", { ascending: false }),
      sb.from("saved_list_items").select("list_id").eq("sku", p.sku),
    ]);
    setLists((l as SavedList[]) ?? []);
    setInSet(new Set((items ?? []).map((r) => (r as { list_id: string }).list_id)));
  }, [user, p.sku]);

  useEffect(() => {
    if (open && user) load();
  }, [open, user, load]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = async (listId: string, on: boolean) => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    setInSet((s) => {
      const n = new Set(s);
      if (on) n.add(listId);
      else n.delete(listId);
      return n;
    });
    if (on) await sb.from("saved_list_items").insert({ list_id: listId, sku: p.sku });
    else await sb.from("saved_list_items").delete().eq("list_id", listId).eq("sku", p.sku);
  };

  const createAndAdd = async () => {
    const sb = getBrowserSupabase();
    if (!sb || !user || !newName.trim()) return;
    setBusy(true);
    const { data } = await sb.from("saved_lists").insert({ user_id: user.id, name: newName.trim() }).select("id,name,created_at").single();
    if (data) {
      await sb.from("saved_list_items").insert({ list_id: (data as SavedList).id, sku: p.sku });
      setNewName("");
      toast(`Added to “${(data as SavedList).name}”`);
    }
    setBusy(false);
    load();
  };

  return (
    <div className="stl" ref={ref}>
      <button type="button" className="cmp-btn cmp-btn-pdp" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <List /> Add to list
      </button>
      {open && (
        <div className="stl-pop">
          {!configured ? null : !user ? (
            <p className="stl-gate">
              <Link href="/login">Sign in</Link> to save products to project lists.
            </p>
          ) : (
            <>
              {lists.length > 0 && (
                <div className="stl-lists">
                  {lists.map((l) => (
                    <label key={l.id} className="stl-item">
                      <input type="checkbox" checked={inSet.has(l.id)} onChange={(e) => toggle(l.id, e.target.checked)} />
                      {l.name}
                    </label>
                  ))}
                </div>
              )}
              <div className="stl-new">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New list name"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); createAndAdd(); } }}
                />
                <button className="btn btn-primary" disabled={busy || !newName.trim()} onClick={createAndAdd}>Add</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
