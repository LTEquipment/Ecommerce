"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { useStore } from "./StoreProvider";
import AddressBook from "./AddressBook";
import ProjectLists from "./ProjectLists";
import AccountDeletion from "./AccountDeletion";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { getProducts } from "@/lib/catalog";
import { money } from "@/lib/format";
import { PRODUCTS } from "@/lib/products";
import type { Product } from "@/lib/types";
import { trackingUrl } from "@/lib/tracking";
import { BACKEND_OFFLINE } from "@/lib/backendMessage";
import { LogOut, Package, Shield, Chat, Google, Facebook } from "./icons";

// Fallback SKU→product map from the bundled seed. Orders store SKUs from the
// LIVE catalog (which admins can extend), so reorder resolves against the live
// catalog fetched on mount and only falls back to this seed until it loads.
const SEED_BY_SKU = new Map(PRODUCTS.map((p) => [p.sku, p]));

const OAUTH = [
  { id: "google" as const, label: "Google", Icon: Google },
  { id: "facebook" as const, label: "Facebook", Icon: Facebook },
];

type Order = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  subtotal?: number | null;
  freight?: number | null;
  payment_status?: string | null;
  carrier?: string | null;
  tracking_number?: string | null;
  ship_name?: string | null;
  ship_company?: string | null;
  ship_phone?: string | null;
  ship_address?: string | null;
  ship_city?: string | null;
  ship_state?: string | null;
  ship_zip?: string | null;
  order_items?: { sku: string | null; name: string; qty: number; unit_price: number }[];
};
type Claim = { id: string; created_at: string; model: string | null; sku: string | null; issue: string | null; status: string };
type Ticket = { id: string; created_at: string; subject: string | null; message: string | null; status: string };
type Reg = { id: string; created_at: string; model: string | null; sku: string | null; serial_number: string | null; purchase_date: string | null; purchased_from: string | null };

type Tab = "profile" | "orders" | "service" | "parts";

function tone(status: string): string {
  if (["approved", "resolved", "paid", "delivered"].includes(status)) return "ok";
  if (["in_review", "in_progress", "pending", "processing"].includes(status)) return "warn";
  if (["rejected", "closed", "cancelled", "refunded"].includes(status)) return "mut";
  return "info"; // submitted | open
}
const pretty = (s: string) => s.replace(/_/g, " ");

// A single editable field row (Yamibuy-style): label + value + inline "Edit".
// Clicking the action swaps the value for an input with Save / Cancel.
function ProfileRow({
  label,
  value,
  placeholder,
  action = "Edit",
  type = "text",
  onSave,
}: {
  label: string;
  value: string;
  placeholder?: string;
  action?: string;
  type?: string;
  onSave: (v: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const isPw = type === "password";

  const start = () => { setVal(isPw ? "" : value); setEditing(true); };
  const save = async () => {
    setBusy(true);
    const ok = await onSave(val.trim());
    setBusy(false);
    if (ok) setEditing(false);
  };

  return (
    <div className="prow">
      <div className="prow-l">
        <label>{label}</label>
        {editing ? (
          <input
            className="prow-input"
            type={isPw ? "password" : type}
            value={val}
            autoFocus
            placeholder={isPw ? "New password" : placeholder}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
          />
        ) : (
          <b className={!isPw && !value ? "muted" : ""}>{isPw ? "••••••••" : value || placeholder || "None"}</b>
        )}
      </div>
      {editing ? (
        <div className="prow-actions">
          <button className="linklike" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
          <button className="prow-cancel" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      ) : (
        <button className="prow-edit" onClick={start}>{action}</button>
      )}
    </div>
  );
}

export default function AccountDashboard() {
  const { user, loading, configured, displayName, signOut, role, dealerStatus, isDealer } = useAuth();
  const { toast, add, openCart } = useStore();

  // Live SKU→product map from the same catalog checkout uses. Until it loads we
  // fall back to the bundled seed, so reorder never treats a live DB-only
  // product as discontinued.
  const [liveBySku, setLiveBySku] = useState<Map<string, Product> | null>(null);
  useEffect(() => {
    let alive = true;
    getProducts().then((ps) => {
      if (alive) setLiveBySku(new Map(ps.map((p) => [p.sku, p])));
    });
    return () => { alive = false; };
  }, []);

  // Re-add every still-available line item from a past order to the cart.
  const reorder = (o: Order) => {
    const bySku = liveBySku ?? SEED_BY_SKU;
    const items = o.order_items ?? [];
    let added = 0;
    let skipped = 0;
    for (const it of items) {
      const p = it.sku ? bySku.get(it.sku) : undefined;
      if (p) {
        add(p, Math.max(1, it.qty));
        added++;
      } else {
        skipped++;
      }
    }
    if (added === 0) {
      toast("These items are no longer in the catalog.");
      return;
    }
    openCart();
    toast(skipped > 0 ? `Added ${added} item${added > 1 ? "s" : ""} · ${skipped} no longer available` : `Added ${added} item${added > 1 ? "s" : ""} to your cart`);
  };
  const router = useRouter();
  const params = useSearchParams();
  const tabParam = params.get("tab");
  const tab: Tab =
    tabParam === "orders" ? "orders" : tabParam === "service" ? "service" : tabParam === "parts" ? "parts" : "profile";

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [claims, setClaims] = useState<Claim[] | null>(null);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [regs, setRegs] = useState<Reg[] | null>(null);
  const [regForm, setRegForm] = useState({ model: "", sku: "", serial: "", date: "", from: "" });
  const [busy, setBusy] = useState(false);

  const [model, setModel] = useState("");
  const [sku, setSku] = useState("");
  const [issue, setIssue] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const dealerPending = role === "dealer" && dealerStatus === "pending";

  // Editable profile fields live in Supabase user_metadata.
  const meta = (user?.user_metadata ?? {}) as Record<string, string>;
  const company = meta.company || "";
  const fullName = meta.full_name || "";
  const phone = meta.phone || "";
  const avatarUrl = meta.avatar_url || "";
  const initial = displayName?.[0]?.toUpperCase() || "L";
  const identities = user?.identities ?? [];

  const [uploading, setUploading] = useState(false);
  const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/avatar", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) { setUploading(false); return toast(json.error || "Upload failed"); }
    const supabase = getBrowserSupabase();
    if (supabase) await supabase.auth.updateUser({ data: { ...meta, avatar_url: json.url } });
    setUploading(false);
    toast("Photo updated.");
  };

  const linkProvider = async (provider: "google" | "facebook") => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const { error } = await supabase.auth.linkIdentity({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/account` },
    });
    if (error) toast(/enabled|disabled|provider|manual/i.test(error.message) ? `${provider} isn't enabled in Supabase yet.` : error.message);
  };
  const unlinkProvider = async (provider: string) => {
    const supabase = getBrowserSupabase();
    const identity = identities.find((i) => i.provider === provider);
    if (!supabase || !identity) return;
    const { error } = await supabase.auth.unlinkIdentity(identity);
    toast(error ? error.message : `${provider} unlinked.`);
  };

  const updateMeta = async (patch: Record<string, string>): Promise<boolean> => {
    const supabase = getBrowserSupabase();
    if (!supabase) return false;
    const { error } = await supabase.auth.updateUser({ data: { ...meta, ...patch } });
    if (error) { toast(error.message); return false; }
    toast("Profile updated.");
    return true;
  };
  const changeEmail = async (email: string): Promise<boolean> => {
    const supabase = getBrowserSupabase();
    if (!supabase || !email) return false;
    const { error } = await supabase.auth.updateUser({ email });
    if (error) { toast(error.message); return false; }
    toast("Check your new email to confirm the change.");
    return true;
  };
  const changePassword = async (password: string): Promise<boolean> => {
    const supabase = getBrowserSupabase();
    if (!supabase) return false;
    if (password.length < 6) { toast("Password must be at least 6 characters."); return false; }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { toast(error.message); return false; }
    toast("Password updated.");
    return true;
  };

  useEffect(() => {
    if (!loading && configured && !user) router.replace("/login?next=/account");
  }, [loading, configured, user, router]);

  const load = useCallback(() => {
    const supabase = getBrowserSupabase();
    if (!supabase || !user) return;
    supabase
      .from("orders")
      .select("*, order_items(sku, name, qty, unit_price)")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as Order[]) ?? []));
    supabase
      .from("warranty_claims")
      .select("id, created_at, model, sku, issue, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setClaims((data as Claim[]) ?? []));
    supabase
      .from("service_tickets")
      .select("id, created_at, subject, message, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setTickets((data as Ticket[]) ?? []));
    supabase
      .from("warranty_registrations")
      .select("id, created_at, model, sku, serial_number, purchase_date, purchased_from")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRegs((data as Reg[]) ?? []));
  }, [user]);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase || !user) return;
    load();
    const channel = supabase
      .channel("rt-account")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `customer_id=eq.${user.id}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "warranty_claims", filter: `user_id=eq.${user.id}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "service_tickets", filter: `user_id=eq.${user.id}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "warranty_registrations", filter: `user_id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load]);

  const submitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase || !user) return;
    setBusy(true);
    const { error } = await supabase.from("warranty_claims").insert({ user_id: user.id, model, sku, issue });
    setBusy(false);
    if (error) return toast(error.message);
    setModel(""); setSku(""); setIssue("");
    toast("Warranty claim filed. We'll review it shortly.");
  };

  const submitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase || !user || !regForm.model.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("warranty_registrations").insert({
      user_id: user.id,
      model: regForm.model,
      sku: regForm.sku || null,
      serial_number: regForm.serial || null,
      purchase_date: regForm.date || null,
      purchased_from: regForm.from || null,
    });
    setBusy(false);
    if (error) return toast(error.message);
    setRegForm({ model: "", sku: "", serial: "", date: "", from: "" });
    toast("Equipment registered — coverage on file.");
  };

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase || !user) return;
    setBusy(true);
    const { error } = await supabase.from("service_tickets").insert({ user_id: user.id, subject, message });
    setBusy(false);
    if (error) return toast(error.message);
    setSubject(""); setMessage("");
    toast("Service ticket opened.");
  };

  if (!configured) {
    return (
      <div className="wrap">
        <div className="auth">
          <div className="card">
            <h1>Account</h1>
            <p className="sub">Accounts aren&apos;t connected in this environment.</p>
            <div className="msg info">{BACKEND_OFFLINE}</div>
            <Link className="btn btn-line btn-block" href="/">Back to home</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !user) {
    return <div className="wrap" style={{ padding: "var(--s7) 0", color: "var(--muted)" }}>Loading your account…</div>;
  }

  const whoSub = isDealer ? "Dealer account" : dealerPending ? "Trade account · under review" : "Customer account";
  const go = (t: Tab) => router.push(t === "profile" ? "/account" : `/account?tab=${t}`);

  return (
    <div className="wrap">
      <div className="account">
        <aside className="acct-side">
          <div className="who">
            <span className="ava">{avatarUrl ? <img src={avatarUrl} alt="" loading="lazy" decoding="async" /> : initial}</span>
            <div style={{ minWidth: 0 }}><b>{displayName}</b><span>{whoSub}</span></div>
          </div>
          <nav>
            <button className={tab === "profile" ? "on" : ""} onClick={() => go("profile")}>Profile</button>
            <button className={tab === "orders" ? "on" : ""} onClick={() => go("orders")}>
              <span>Orders</span><span className="cnt">{orders?.length ?? "·"}</span>
            </button>
            <button className={tab === "service" ? "on" : ""} onClick={() => go("service")}>
              <span>Warranty &amp; service</span><span className="cnt">{(claims?.length ?? 0) + (tickets?.length ?? 0) || "·"}</span>
            </button>
            <button className={tab === "parts" ? "on" : ""} onClick={() => go("parts")}>
              <span>Parts &amp; reorders</span>
            </button>
            <button className="signout" onClick={() => { signOut(); router.push("/"); }}>
              <span style={{ display: "flex", gap: 8, alignItems: "center" }}><LogOut style={{ width: 16, height: 16 }} /> Sign out</span>
            </button>
          </nav>
        </aside>

        <div className="acct-main">
          {tab === "profile" && (
            <div className="panel">
              <h2 className="ai-title">Account information</h2>
              {dealerPending && (
                <div className="msg info">Your <b>trade account is under review</b>. Contract pricing unlocks once L&amp;T approves it — usually within one business day.</div>
              )}

              <div className="prof-grid">
                <section className="prof-col">
                  <h3 className="prof-h">Profile</h3>
                  <div className="prof-id">
                    <span className="prof-ava">{avatarUrl ? <img src={avatarUrl} alt="" loading="lazy" decoding="async" /> : initial}</span>
                    <div style={{ minWidth: 0 }}>
                      <label className="prof-photo">
                        {uploading ? "Uploading…" : "Change photo"}
                        <input type="file" accept="image/*" onChange={onAvatar} hidden disabled={uploading} />
                      </label>
                      <span className="prof-photo-hint">JPG or PNG · up to 5MB</span>
                    </div>
                  </div>
                  <ProfileRow label="Company / kitchen" value={company} placeholder="Add your company" onSave={(v) => updateMeta({ company: v })} />
                  <ProfileRow label="Contact name" value={fullName} placeholder="Add a contact name" onSave={(v) => updateMeta({ full_name: v })} />
                  <div className="prow">
                    <div className="prow-l"><label>Account type</label><b>{isDealer ? "Dealer" : dealerPending ? "Trade — under review" : "Customer"}</b></div>
                  </div>
                </section>

                <section className="prof-col">
                  <h3 className="prof-h">Login &amp; security</h3>
                  <ProfileRow label="Email" value={user.email || ""} type="email" action="Change" onSave={changeEmail} />
                  <ProfileRow label="Password" value="set" type="password" action="Change" onSave={changePassword} />
                  <ProfileRow label="Phone" value={phone} placeholder="None" action={phone ? "Change" : "Add"} onSave={(v) => updateMeta({ phone: v })} />

                  <h3 className="prof-h" style={{ marginTop: "var(--s5)" }}>Link your account</h3>
                  {OAUTH.map(({ id, label, Icon }) => {
                    const linked = identities.some((i) => i.provider === id);
                    return (
                      <div className="prow link-row" key={id}>
                        <div className="prow-l"><span className="link-ic"><Icon /></span><b>{label}</b></div>
                        <button className="prow-edit" onClick={() => (linked ? unlinkProvider(id) : linkProvider(id))}>
                          {linked ? "Unlink" : "Link"}
                        </button>
                      </div>
                    );
                  })}
                </section>
              </div>

              <div className="prof-foot">
                {isDealer ? (
                  <>
                    <p className="note" style={{ marginTop: 0 }}>Your <b>contract pricing</b> is applied automatically at checkout. Price lists and multi-site billing are managed with your account manager.</p>
                    <div className="dealer-links">
                      <Link href="/products">Volume price list</Link>
                      <Link href="/vendors">Spec sheets &amp; resources</Link>
                      <Link href="/contact">Contact your account manager</Link>
                    </div>
                  </>
                ) : dealerPending ? (
                  <p className="note" style={{ marginTop: 0 }}>Buying for a single kitchen? You&apos;re all set — order at list price while your trade account is reviewed.</p>
                ) : (
                  <p className="note" style={{ marginTop: 0 }}>Buying for a business or multiple locations? <Link href="/contact" style={{ color: "var(--red)", fontWeight: 600 }}>Ask about a trade account</Link> for contract pricing.</p>
                )}
              </div>
              <AddressBook />
              <ProjectLists />
              <AccountDeletion />
            </div>
          )}

          {tab === "orders" && (
            <div className="panel">
              <div className="panel-head"><h2>Orders</h2></div>
              {orders === null ? (
                <div>{[0, 1, 2].map((i) => <div key={i} className="skel skel-order" />)}</div>
              ) : orders.length === 0 ? (
                <div className="emptybox">
                  <Package />
                  <div className="m">No orders yet</div>
                  <div className="s">Orders you place will appear here with live status.</div>
                  <Link className="btn btn-primary" href="/products">Start shopping</Link>
                </div>
              ) : (
                orders.map((o) => {
                  const isOpen = openOrder === o.id;
                  const track = trackingUrl(o.carrier, o.tracking_number);
                  return (
                  <div className={`order${isOpen ? " open" : ""}`} key={o.id}>
                    <div className="oh">
                      <span>#{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleDateString()}</span>
                      <span className={`pill ${tone(o.status)}`}>{pretty(o.status)}</span>
                    </div>
                    {o.tracking_number && (
                      <div className="order-track">
                        Shipped{o.carrier ? ` via ${o.carrier}` : ""} · <b>{o.tracking_number}</b>
                        {track && <a href={track} target="_blank" rel="noreferrer">Track →</a>}
                      </div>
                    )}
                    <div style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
                      {(o.order_items ?? []).map((it, i) => (<div key={i}>{it.qty} × {it.name}</div>))}
                    </div>
                    {isOpen && (
                      <div className="order-detail">
                        <div className="od-lines">
                          {(o.order_items ?? []).map((it, i) => (
                            <div className="od-line" key={i}>
                              <span>{it.qty} × {it.name}</span>
                              <span>{money((Number(it.unit_price) || 0) * it.qty)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="od-totals">
                          {o.subtotal != null && <div><span>Subtotal</span><b>{money(Number(o.subtotal))}</b></div>}
                          {o.freight != null && <div><span>Freight</span><b>{Number(o.freight) ? money(Number(o.freight)) : "FREE"}</b></div>}
                          <div className="od-grand"><span>Total</span><b>{money(o.total)}</b></div>
                          {o.payment_status && <div className="od-pay"><span>Payment</span><b>{pretty(o.payment_status)}</b></div>}
                        </div>
                        {(o.ship_name || o.ship_address) && (
                          <div className="od-ship">
                            <span className="od-ship-h">Ship to</span>
                            {o.ship_name && <div>{o.ship_name}{o.ship_company ? ` · ${o.ship_company}` : ""}</div>}
                            {o.ship_address && <div>{o.ship_address}</div>}
                            {(o.ship_city || o.ship_state || o.ship_zip) && <div>{[o.ship_city, o.ship_state].filter(Boolean).join(", ")} {o.ship_zip}</div>}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="order-foot">
                      <div className="order-foot-actions">
                        <button className="btn btn-line reorder-btn" onClick={() => reorder(o)}>Reorder</button>
                        <Link className="btn btn-line" href={`/account/orders/${o.id}`}>Invoice</Link>
                      </div>
                      <div className="order-foot-right">
                        <button className="order-toggle" onClick={() => setOpenOrder(isOpen ? null : o.id)}>
                          {isOpen ? "Hide details" : "View details"}
                        </button>
                        <span className="order-total">{money(o.total)}</span>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          )}

          {tab === "service" && (
            <div className="panel">
              <div className="panel-head"><h2>Register your equipment</h2></div>
              <p className="note" style={{ marginTop: 0 }}>Register purchased equipment to keep its warranty coverage and service history on file.</p>
              <form onSubmit={submitRegistration}>
                <div className="field-row">
                  <div className="field"><label>Model / product</label><input value={regForm.model} onChange={(e) => setRegForm({ ...regForm, model: e.target.value })} placeholder="Panda Turbo Wok Range" required /></div>
                  <div className="field"><label>SKU (optional)</label><input value={regForm.sku} onChange={(e) => setRegForm({ ...regForm, sku: e.target.value })} placeholder="52527" /></div>
                </div>
                <div className="field-row">
                  <div className="field"><label>Serial number</label><input value={regForm.serial} onChange={(e) => setRegForm({ ...regForm, serial: e.target.value })} placeholder="On the data plate" /></div>
                  <div className="field"><label>Purchase date</label><input type="date" value={regForm.date} onChange={(e) => setRegForm({ ...regForm, date: e.target.value })} /></div>
                </div>
                <div className="field"><label>Purchased from (optional)</label><input value={regForm.from} onChange={(e) => setRegForm({ ...regForm, from: e.target.value })} placeholder="L&amp;T, a dealer, etc." /></div>
                <button className="btn btn-primary" disabled={busy} type="submit">{busy ? "Registering…" : "Register equipment"}</button>
              </form>

              <div className="panel-head" style={{ marginTop: "var(--s5)" }}><h2>Registered equipment</h2></div>
              {regs === null ? (
                <div>{[0, 1].map((i) => <div key={i} className="skel skel-order" />)}</div>
              ) : regs.length === 0 ? (
                <div className="emptybox"><Shield /><div className="m">No equipment registered</div><div className="s">Register a unit above to keep its coverage on file.</div></div>
              ) : (
                regs.map((r) => (
                  <div className="order" key={r.id}>
                    <div className="oh">
                      <span>{r.model || "Equipment"}{r.sku ? ` · ${r.sku}` : ""}</span>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>{r.purchase_date ? `Purchased ${new Date(r.purchase_date).toLocaleDateString()}` : new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    {(r.serial_number || r.purchased_from) && (
                      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                        {r.serial_number ? `Serial ${r.serial_number}` : ""}{r.serial_number && r.purchased_from ? " · " : ""}{r.purchased_from || ""}
                      </div>
                    )}
                  </div>
                ))
              )}

              <div className="panel-head" style={{ marginTop: "var(--s6)" }}><h2>File a warranty claim</h2></div>
              <form onSubmit={submitClaim}>
                <div className="field-row">
                  <div className="field"><label>Model</label><input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Panda 4-Burner Range" required /></div>
                  <div className="field"><label>Serial / SKU</label><input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="PR-4B-2024" /></div>
                </div>
                <div className="field"><label>What went wrong?</label><textarea value={issue} onChange={(e) => setIssue(e.target.value)} rows={3} placeholder="Describe the fault, when it started, and any error codes." required /></div>
                <button className="btn btn-primary" disabled={busy} type="submit">{busy ? "Filing…" : "Submit claim"}</button>
              </form>

              <div className="panel-head" style={{ marginTop: "var(--s5)" }}><h2>Your claims</h2></div>
              {claims === null ? (
                <div>{[0, 1].map((i) => <div key={i} className="skel skel-order" />)}</div>
              ) : claims.length === 0 ? (
                <div className="emptybox"><Shield /><div className="m">No claims yet</div><div className="s">Claims you file appear here with live status.</div></div>
              ) : (
                claims.map((c) => (
                  <div className="order" key={c.id}>
                    <div className="oh">
                      <span>{c.model || "Warranty claim"} · {new Date(c.created_at).toLocaleDateString()}</span>
                      <span className={`pill ${tone(c.status)}`}>{pretty(c.status)}</span>
                    </div>
                    {c.sku && <div style={{ fontSize: 13, color: "var(--muted)" }}>SKU {c.sku}</div>}
                    {c.issue && <div style={{ fontSize: 13.5, color: "var(--ink-2)", marginTop: 4 }}>{c.issue}</div>}
                  </div>
                ))
              )}

              <div className="panel-head" style={{ marginTop: "var(--s6)" }}><h2>Open a service ticket</h2></div>
              <form onSubmit={submitTicket}>
                <div className="field"><label>Subject</label><input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Installation help for walk-in cooler" required /></div>
                <div className="field"><label>Details</label><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Tell us what you need and your location." required /></div>
                <button className="btn btn-primary" disabled={busy} type="submit">{busy ? "Opening…" : "Open ticket"}</button>
              </form>

              <div className="panel-head" style={{ marginTop: "var(--s5)" }}><h2>Your tickets</h2></div>
              {tickets === null ? (
                <div>{[0, 1].map((i) => <div key={i} className="skel skel-order" />)}</div>
              ) : tickets.length === 0 ? (
                <div className="emptybox"><Chat /><div className="m">No tickets yet</div><div className="s">Open a ticket and track its status here in real time.</div></div>
              ) : (
                tickets.map((t) => (
                  <div className="order" key={t.id}>
                    <div className="oh">
                      <span>{t.subject || "Service ticket"} · {new Date(t.created_at).toLocaleDateString()}</span>
                      <span className={`pill ${tone(t.status)}`}>{pretty(t.status)}</span>
                    </div>
                    {t.message && <div style={{ fontSize: 13.5, color: "var(--ink-2)", marginTop: 4 }}>{t.message}</div>}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "parts" && (
            <div className="panel">
              <div className="panel-head"><h2>Parts &amp; reorders</h2></div>
              <p className="note" style={{ marginTop: 0 }}>Replacement parts ship from our NYC facility. Browse the catalog to reorder, or open a service ticket if you can&apos;t find a part.</p>
              <div className="emptybox">
                <Package />
                <div className="m">Reorder from the catalog</div>
                <div className="s">Burners, thermostats, gaskets, casters and more.</div>
                <div style={{ display: "flex", gap: "var(--s3)", flexWrap: "wrap", justifyContent: "center" }}>
                  <Link className="btn btn-primary" href="/products">Browse parts</Link>
                  <Link className="btn btn-line" href="/warranty">Warranty policy</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
