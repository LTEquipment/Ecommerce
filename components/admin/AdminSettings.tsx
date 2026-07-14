"use client";

import { useEffect, useState } from "react";

type SettingsMap = Record<string, unknown>;

export default function AdminSettings() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d: { settings?: SettingsMap }) => setEnabled(d.settings?.investor_relations_enabled === true))
      .catch(() => setEnabled(false));
  }, []);

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
    </div>
  );
}
