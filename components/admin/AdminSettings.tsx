"use client";

import { useEffect, useState } from "react";

type SettingsMap = Record<string, unknown>;

export default function AdminSettings() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [ft, setFt] = useState("");
  const [ff, setFf] = useState("");
  const [taxPct, setTaxPct] = useState("");
  const [dealerPct, setDealerPct] = useState("");
  const [savingShip, setSavingShip] = useState(false);
  const [shipMsg, setShipMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [ann, setAnn] = useState("");
  const [savingAnn, setSavingAnn] = useState(false);
  const [annMsg, setAnnMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d: { settings?: SettingsMap }) => {
        setEnabled(d.settings?.investor_relations_enabled === true);
        const n = (k: string, def: number) => (typeof d.settings?.[k] === "number" ? (d.settings[k] as number) : def);
        setFt(String(n("freight_threshold", 999)));
        setFf(String(n("freight_fee", 89)));
        setTaxPct(String(+(n("tax_rate", 0.08875) * 100).toFixed(4)));
        setDealerPct(String(n("dealer_discount_pct", 0)));
        setAnn(typeof d.settings?.announcement === "string" ? (d.settings.announcement as string) : "");
      })
      .catch(() => setEnabled(false));
  }, []);

  // Auto-dismiss the save notices so they don't linger indefinitely.
  useEffect(() => { if (!shipMsg) return; const id = setTimeout(() => setShipMsg(null), 3000); return () => clearTimeout(id); }, [shipMsg]);
  useEffect(() => { if (!msg) return; const id = setTimeout(() => setMsg(null), 3000); return () => clearTimeout(id); }, [msg]);
  useEffect(() => { if (!annMsg) return; const id = setTimeout(() => setAnnMsg(null), 3000); return () => clearTimeout(id); }, [annMsg]);

  async function saveAnnouncement() {
    setSavingAnn(true);
    setAnnMsg(null);
    try {
      const r = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: "announcement", value: ann.trim().slice(0, 200) }),
      });
      if (!r.ok) throw new Error();
      setAnnMsg({ ok: true, text: "Saved" });
    } catch {
      setAnnMsg({ ok: false, text: "Couldn’t save — try again" });
    } finally {
      setSavingAnn(false);
    }
  }

  async function saveShipping() {
    const t = parseFloat(ft), f = parseFloat(ff), tp = parseFloat(taxPct), dp = parseFloat(dealerPct);
    const LABELS: Record<string, string> = { freight_threshold: "free-freight threshold", freight_fee: "freight fee", tax_rate: "sales tax", dealer_discount_pct: "dealer discount" };
    const entries: Array<[string, number]> = [];
    if (Number.isFinite(t)) entries.push(["freight_threshold", t]);
    if (Number.isFinite(f)) entries.push(["freight_fee", f]);
    if (Number.isFinite(tp)) entries.push(["tax_rate", tp / 100]);
    if (Number.isFinite(dp)) entries.push(["dealer_discount_pct", dp]);
    if (entries.length === 0) { setShipMsg({ ok: false, text: "Enter a value to save" }); return; }
    setSavingShip(true);
    setShipMsg(null);
    try {
      const rs = await Promise.all(entries.map(([key, value]) =>
        fetch("/api/admin/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, value }) })
          .then((r) => ({ key, ok: r.ok }))
      ));
      const failed = rs.filter((r) => !r.ok).map((r) => LABELS[r.key] ?? r.key);
      setShipMsg(failed.length === 0 ? { ok: true, text: "Saved" } : { ok: false, text: `Couldn’t save ${failed.join(", ")}` });
    } catch {
      setShipMsg({ ok: false, text: "Couldn’t save — try again" });
    } finally {
      setSavingShip(false);
    }
  }

  async function save(next: boolean) {
    setSaving(true);
    setMsg(null);
    try {
      const r = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: "investor_relations_enabled", value: next }),
      });
      if (!r.ok) throw new Error();
      setEnabled(next);
      setMsg({ ok: true, text: "Saved" });
    } catch {
      setMsg({ ok: false, text: "Couldn't save — try again" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-settings">
      <div className="set-card">
        <div className="set-row">
          <div className="set-info">
            <h3>Investor Relations</h3>
            <p>
              Show the Investor Relations page and its links across the site (top bar and footer).
              Company highlights and corporate governance live inside that page. Keep this off until
              the company is ready to present to investors — while off, the page returns a 404 and no
              links appear.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled === true}
            aria-label="Toggle Investor Relations visibility"
            className={`toggle${enabled ? " on" : ""}`}
            disabled={enabled === null || saving}
            onClick={() => save(!enabled)}
          >
            <span className="knob" />
          </button>
        </div>
        <div className="set-foot">
          <span className={`set-state${enabled ? " on" : ""}`}>
            {enabled === null ? "Loading…" : enabled ? "● Visible to everyone" : "○ Hidden from the site"}
          </span>
          {msg && <span className={`set-msg${msg.ok ? "" : " err"}`}>{msg.text}</span>}
        </div>
      </div>

      <div className="set-card">
        <div className="set-info">
          <h3>Shipping, tax &amp; dealer pricing</h3>
          <p>
            Freight and sales tax used across the cart, checkout and the authoritative order total.
            Dealer discount is the % off list applied automatically to <b>approved</b> trade accounts
            at checkout and on quotes (0 = list price). Changes apply immediately storefront-wide.
          </p>
        </div>
        <div className="set-nums">
          <label>Free freight over ($)
            <input type="number" min={0} step={1} value={ft} onChange={(e) => setFt(e.target.value)} />
          </label>
          <label>Freight fee below threshold ($)
            <input type="number" min={0} step={1} value={ff} onChange={(e) => setFf(e.target.value)} />
          </label>
          <label>Sales tax (%)
            <input type="number" min={0} max={25} step={0.001} value={taxPct} onChange={(e) => setTaxPct(e.target.value)} />
          </label>
          <label>Dealer discount (%)
            <input type="number" min={0} max={90} step={0.5} value={dealerPct} onChange={(e) => setDealerPct(e.target.value)} />
          </label>
        </div>
        <div className="set-foot">
          <button type="button" className="btn btn-primary" disabled={savingShip} onClick={saveShipping}>
            {savingShip ? "Saving…" : "Save shipping & tax"}
          </button>
          {shipMsg && <span className={`set-msg${shipMsg.ok ? "" : " err"}`}>{shipMsg.text}</span>}
        </div>
      </div>

      <div className="set-card">
        <div className="set-info">
          <h3>Announcement banner</h3>
          <p>
            A short message shown in a bar across the top of every storefront page — free-freight offers,
            holiday hours, lead-time notices. Leave it blank to hide the bar. Changes appear site-wide
            within a few minutes.
          </p>
        </div>
        <div className="set-ann">
          <input
            type="text"
            maxLength={200}
            value={ann}
            onChange={(e) => setAnn(e.target.value)}
            placeholder="e.g. Free freight on orders over $999 — ships in 24–48h"
            aria-label="Announcement banner text"
          />
          {ann.trim() && <div className="set-ann-preview" aria-hidden="true">{ann.trim()}</div>}
        </div>
        <div className="set-foot">
          <button type="button" className="btn btn-primary" disabled={savingAnn} onClick={saveAnnouncement}>
            {savingAnn ? "Saving…" : ann.trim() ? "Save announcement" : "Clear announcement"}
          </button>
          {annMsg && <span className={`set-msg${annMsg.ok ? "" : " err"}`}>{annMsg.text}</span>}
        </div>
      </div>
    </div>
  );
}
