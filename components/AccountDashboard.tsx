"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { useStore } from "./StoreProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { money } from "@/lib/format";
import { LogOut, Package, Shield, Chat } from "./icons";

type Order = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  order_items?: { name: string; qty: number; unit_price: number }[];
};
type Claim = { id: string; created_at: string; model: string | null; sku: string | null; issue: string | null; status: string };
type Ticket = { id: string; created_at: string; subject: string | null; message: string | null; status: string };

type Tab = "profile" | "orders" | "service" | "parts";

function tone(status: string): string {
  if (["approved", "resolved", "paid", "delivered"].includes(status)) return "ok";
  if (["in_review", "in_progress", "pending", "processing"].includes(status)) return "warn";
  if (["rejected", "closed", "cancelled", "refunded"].includes(status)) return "mut";
  return "info"; // submitted | open
}
const pretty = (s: string) => s.replace(/_/g, " ");

export default function AccountDashboard() {
  const { user, loading, configured, displayName, signOut, role, dealerStatus, isDealer } = useAuth();
  const { toast } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const tabParam = params.get("tab");
  const tab: Tab =
    tabParam === "orders" ? "orders" : tabParam === "service" ? "service" : tabParam === "parts" ? "parts" : "profile";

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [claims, setClaims] = useState<Claim[] | null>(null);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [busy, setBusy] = useState(false);

  const [model, setModel] = useState("");
  const [sku, setSku] = useState("");
  const [issue, setIssue] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const dealerPending = role === "dealer" && dealerStatus === "pending";

  useEffect(() => {
    if (!loading && configured && !user) router.replace("/login?next=/account");
  }, [loading, configured, user, router]);

  const load = useCallback(() => {
    const supabase = getBrowserSupabase();
    if (!supabase || !user) return;
    supabase
      .from("orders")
      .select("id, created_at, status, total, order_items(name, qty, unit_price)")
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
            <div className="msg info">Add Supabase keys to <b>.env.local</b> to enable sign-in and your account (see README).</div>
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
        <h1>Your account</h1>
        <aside className="acct-side">
          <div className="who">
            <span className="ava">{displayName?.[0]?.toUpperCase() || "L"}</span>
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
              <div className="panel-head"><h2>Profile</h2><button className="btn btn-primary" onClick={() => toast("Profile saved.")}>Save changes</button></div>
              {dealerPending && (
                <div className="msg info">Your <b>trade account is under review</b>. Contract pricing unlocks once L&amp;T approves it — usually within one business day.</div>
              )}
              <div className="field-row">
                <div className="field"><label>{role === "dealer" ? "Dealer / company" : "Company / kitchen"}</label><input defaultValue={displayName} /></div>
                <div className="field"><label>Email</label><input defaultValue={user.email} disabled /></div>
              </div>
              {isDealer ? (
                <>
                  <p className="note">Your <b>contract pricing</b> is applied automatically at checkout. Price lists, spec sheets and multi-site billing are managed with your dedicated account manager.</p>
                  <div className="dealer-links">
                    <Link href="/products">Volume price list</Link>
                    <Link href="/vendors">Spec sheets &amp; resources</Link>
                    <Link href="/contact">Contact your account manager</Link>
                  </div>
                </>
              ) : dealerPending ? (
                <p className="note">Buying for a single kitchen? You&apos;re all set — browse and order at list price while your trade account is reviewed.</p>
              ) : (
                <p className="note">Buying for a business or multiple locations? <Link href="/contact" style={{ color: "var(--red)", fontWeight: 600 }}>Ask about a trade account</Link> for contract pricing.</p>
              )}
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
                orders.map((o) => (
                  <div className="order" key={o.id}>
                    <div className="oh">
                      <span>#{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleDateString()}</span>
                      <span className={`pill ${tone(o.status)}`}>{pretty(o.status)}</span>
                    </div>
                    <div style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
                      {(o.order_items ?? []).map((it, i) => (<div key={i}>{it.qty} × {it.name}</div>))}
                    </div>
                    <div style={{ textAlign: "right", fontWeight: 700, marginTop: 8 }}>{money(o.total)}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "service" && (
            <div className="panel">
              <div className="panel-head"><h2>File a warranty claim</h2></div>
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
