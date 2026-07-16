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
  const [savingShip, setSavingShip] = useState(false);
  const [shipMsg, setShipMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d: { settings?: SettingsMap }) => {
        setEnabled(d.settings?.investor_relations_enabled === true);
        const n = (k: string, def: number) => (typeof d.settings?.[k] === "number" ? (d.settings[k] as number) : def);
        setFt(String(n("freight_threshold", 999)));
        setFf(String(n("freight_fee", 89)));
        setTaxPct(String(+(n("tax_rate", 0.08875) * 100).toFixed(4)));
      })
      .catch(() => setEnabled(false));
  }, []);

  async function saveShipping() {
    setSavingShip(true);
    setShipMsg(null);
    const t = parseFloat(ft), f = parseFloat(ff), tp = parseFloat(taxPct);
    const posts: Array<Promise<Response>> = [];
    const post = (key: string, value: number) =>
      fetch("/api/admin/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, value }) });
    if (Number.isFinite(t)) posts.push(post("freight_threshold", t));
    if (Number.isFinite(f)) posts.push(post("freight_fee", f));
    if (Number.isFinite(tp)) posts.push(post("tax_rate", tp / 100));
    try {
      const rs = await Promise.all(posts);
      if (rs.every((r) => r.ok)) setShipMsg({ ok: true, text: "Saved" });
      else setShipMsg({ ok: false, text: "Some values were rejected" });
    } catch {
      setShipMsg({ ok: false, text: "Couldn't save — try again" });
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
          <h3>Shipping &amp; tax</h3>
          <p>
            Freight and sales tax used across the cart, checkout and the authoritative order total.
            Changes apply immediately storefront-wide.
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
        </div>
        <div className="set-foot">
          <button type="button" className="btn btn-primary" disabled={savingShip} onClick={saveShipping}>
            {savingShip ? "Saving…" : "Save shipping & tax"}
          </button>
          {shipMsg && <span className={`set-msg${shipMsg.ok ? "" : " err"}`}>{shipMsg.text}</span>}
        </div>
      </div>
    </div>
  );
}
