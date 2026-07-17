"use client";

import { useCallback, useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { useAuth } from "./AuthProvider";
import { useStore } from "./StoreProvider";
import { ADDRESS_COLS, type Address } from "@/lib/addresses";

const EMPTY = { label: "", name: "", company: "", phone: "", address: "", city: "", state: "", zip: "" };

/** Manage saved shipping addresses (own rows via RLS). Used in the account. */
export default function AddressBook() {
  const { user } = useAuth();
  const { toast } = useStore();
  const [rows, setRows] = useState<Address[] | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    sb.from("customer_addresses")
      .select(ADDRESS_COLS)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as Address[]) ?? []));
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const add = async () => {
    const sb = getBrowserSupabase();
    if (!sb || !user || !form.address.trim()) return;
    setBusy(true);
    const { error } = await sb.from("customer_addresses").insert({ ...form, user_id: user.id });
    setBusy(false);
    if (error) return toast(error.message || "Couldn’t save the address — try again", "error"); // keep the typed form
    setAdding(false);
    setForm(EMPTY);
    load();
  };

  const del = async (id: string) => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { error } = await sb.from("customer_addresses").delete().eq("id", id);
    if (error) return toast(error.message || "Couldn’t remove the address", "error");
    load();
  };

  const setDefault = async (id: string) => {
    const sb = getBrowserSupabase();
    if (!sb || !user) return;
    await sb.from("customer_addresses").update({ is_default: false }).eq("user_id", user.id);
    await sb.from("customer_addresses").update({ is_default: true }).eq("id", id);
    load();
  };

  if (!user) return null;

  return (
    <div className="addr-book">
      <div className="addr-head">
        <h3>Saved addresses</h3>
        {!adding && <button className="btn btn-line" onClick={() => setAdding(true)}>Add address</button>}
      </div>
      {rows === null ? (
        <div className="skel skel-row" />
      ) : (
        <>
          {rows.length === 0 && !adding && (
            <p className="note" style={{ marginTop: 0 }}>No saved addresses yet — add one to speed up checkout.</p>
          )}
          {rows.length > 0 && (
            <div className="addr-list">
              {rows.map((a) => (
                <div className={`addr-card${a.is_default ? " default" : ""}`} key={a.id}>
                  <div className="addr-body">
                    <div className="addr-label">
                      {a.label || "Address"}
                      {a.is_default && <span className="addr-def">Default</span>}
                    </div>
                    {a.name && <div>{a.name}{a.company ? ` · ${a.company}` : ""}</div>}
                    <div>{a.address}</div>
                    <div>{[a.city, a.state].filter(Boolean).join(", ")} {a.zip}</div>
                    {a.phone && <div>{a.phone}</div>}
                  </div>
                  <div className="addr-actions">
                    {!a.is_default && <button onClick={() => setDefault(a.id)}>Set default</button>}
                    <button className="addr-del" onClick={() => del(a.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {adding && (
            <div className="addr-form">
              <input aria-label="Address label" autoComplete="off" placeholder="Label (e.g. Main kitchen)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
              <div className="addr-form-grid">
                <input aria-label="Full name" autoComplete="name" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input aria-label="Company" autoComplete="organization" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <input aria-label="Street address (required)" aria-required="true" autoComplete="street-address" placeholder="Street address *" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <div className="addr-form-grid3">
                <input aria-label="City" autoComplete="address-level2" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <input aria-label="State" autoComplete="address-level1" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                <input aria-label="ZIP code" autoComplete="postal-code" placeholder="ZIP" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
              </div>
              <input aria-label="Phone" type="tel" autoComplete="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <div className="addr-form-actions">
                <button className="btn btn-primary" onClick={add} disabled={busy || !form.address.trim()}>
                  {busy ? "Saving…" : "Save address"}
                </button>
                <button className="btn btn-line" onClick={() => { setAdding(false); setForm(EMPTY); }}>Cancel</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
