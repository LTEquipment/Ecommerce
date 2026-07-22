"use client";

import { useEffect, useState } from "react";

/**
 * Pull the catalog from the ERP.
 *
 * The ERP is the master and its catalog is actively curated — products appear
 * and disappear as stock is inspected — so this needs to be runnable by whoever
 * is doing that, not by whoever can reach an API client.
 *
 * Preview always runs first and Apply is only enabled once it has: this writes
 * to every product the shop sells and can remove products entirely, which is
 * not something to trigger from a single unexamined click.
 */

type Report = {
  ok: boolean;
  reason?: string;
  fetched: number;
  matched: number;
  updated: number;
  unchanged: number;
  created: number;
  skipped: number;
  unnamed: string[];
  unpriced: string[];
  delisted: string[];
  delistRefused?: string;
  missingFromErp: string[];
  unmappedCategories: string[];
  failures: { sku: string; error: string }[];
  dryRun: boolean;
};

export default function ErpSync() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState<"" | "preview" | "apply">("");
  const [preview, setPreview] = useState<Report | null>(null);
  const [applied, setApplied] = useState<Report | null>(null);
  const [delist, setDelist] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/admin/erp-sync")
      .then((r) => r.json())
      .then((d: { configured?: boolean }) => setConfigured(d.configured === true))
      .catch(() => setConfigured(false));
  }, []);

  async function run(dryRun: boolean) {
    setBusy(dryRun ? "preview" : "apply");
    setErr("");
    if (dryRun) setApplied(null);
    try {
      const r = await fetch("/api/admin/erp-sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ createMissing: true, delistMissing: delist, dryRun }),
      });
      const j = (await r.json()) as Report;
      if (dryRun) setPreview(j);
      else { setApplied(j); setPreview(null); }
      if (!j.ok) setErr(j.reason ?? "The sync did not complete.");
    } catch {
      // A large apply can outlive the request without having failed — it writes
      // per product. Say so rather than reporting a failure that may not be one.
      setErr(
        dryRun
          ? "Couldn’t reach the ERP — try again."
          : "The request timed out. The sync may still be running; preview again in a minute to see where it got to."
      );
    } finally {
      setBusy("");
    }
  }

  if (configured === null) return <div className="set-card">Checking ERP connection…</div>;
  if (!configured) {
    return (
      <div className="set-card">
        <h3>ERP catalog sync</h3>
        <p className="set-info">
          Not connected. <code>ERP_API_URL</code> and <code>ERP_API_KEY</code> must be set.
        </p>
      </div>
    );
  }

  const r = applied ?? preview;

  return (
    <div className="set-card">
      <h3>ERP catalog sync</h3>
      <p className="set-info">
        Pulls products, prices and stock from the ERP. The ERP is the master —
        anything it no longer lists is removed from the shop here.
      </p>

      {/* Not .set-row: that spaces its children apart, which threw the two
          buttons to opposite ends of the card and read as unrelated controls. */}
      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "14px 0" }}>
        <input
          type="checkbox"
          checked={delist}
          onChange={(e) => setDelist(e.target.checked)}
          style={{ marginTop: 3, flex: "0 0 auto" }}
        />
        <span>
          Remove products the ERP no longer sells
          <br />
          <small className="set-info">
            Refuses if it would remove more than a quarter of the catalog — that is
            usually a truncated feed rather than a real discontinuation.
          </small>
        </span>
      </label>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={() => run(true)} disabled={busy !== ""}>
          {busy === "preview" ? "Checking…" : "Preview changes"}
        </button>
        <button
          className="btn btn-line"
          onClick={() => run(false)}
          disabled={busy !== "" || !preview?.ok}
          title={preview?.ok ? undefined : "Preview first"}
        >
          {busy === "apply" ? "Syncing…" : "Apply"}
        </button>
      </div>

      {err && <p className="set-info" style={{ color: "var(--danger, #b3261e)" }}>{err}</p>}

      {r && (
        <div className="set-foot">
          <strong>{applied ? "Applied" : "Preview — nothing has changed yet"}</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, lineHeight: 1.7 }}>
            <li>{r.fetched} products in the ERP</li>
            <li>{r.created} to add{applied ? " — added" : ""}</li>
            <li>{r.updated} price or stock change{r.updated === 1 ? "" : "s"}</li>
            <li>{r.unchanged} already up to date</li>
            {r.delisted.length > 0 && (
              <li>
                <strong>{r.delisted.length} removed</strong> — no longer in the ERP
                {!applied && " (would be)"}
              </li>
            )}
            {r.unpriced.length > 0 && (
              <li>
                {r.unpriced.length} withheld — still at the ERP’s $1.00 placeholder,
                so they cannot be sold yet
              </li>
            )}
            {r.unnamed.length > 0 && <li>{r.unnamed.length} withheld — the ERP row has no name</li>}
            {r.unmappedCategories.length > 0 && (
              <li>Filed under Accessories, no department matched: {r.unmappedCategories.join(", ")}</li>
            )}
            {r.delistRefused && (
              <li style={{ color: "var(--danger, #b3261e)" }}>
                <strong>Removal refused:</strong> {r.delistRefused}
              </li>
            )}
            {r.failures.length > 0 && (
              <li style={{ color: "var(--danger, #b3261e)" }}>
                {r.failures.length} failed: {r.failures.slice(0, 3).map((f) => f.sku).join(", ")}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
