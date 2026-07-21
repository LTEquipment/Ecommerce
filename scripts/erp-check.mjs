#!/usr/bin/env node
/**
 * Preflight for the ERP order sync: `npm run erp:check`.
 *
 * Answers "is it actually wired up?" without placing a real order. Sends one
 * probe the ingest function is expected to REJECT (no items), so a healthy
 * round-trip proves URL, token and function are all good while writing nothing
 * to the ERP.
 */
import { readFileSync } from "node:fs";

// .env.local isn't loaded outside Next, so read it directly.
for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    /* file may not exist */
  }
}

const url = process.env.ERP_INGEST_URL;
const token = process.env.ERP_INGEST_TOKEN;
const ok = (m) => console.log(`  [32mOK[0m    ${m}`);
const bad = (m) => console.log(`  [31mFAIL[0m  ${m}`);
const info = (m) => console.log(`        ${m}`);

console.log("\nERP order sync preflight\n");

if (!url || !token) {
  bad("Not configured — the storefront will skip the ERP entirely.");
  info(`ERP_INGEST_URL   ${url ? "set" : "MISSING"}`);
  info(`ERP_INGEST_TOKEN ${token ? "set" : "MISSING"}`);
  info("");
  info("Set both in .env.local (see .env.example). The token must equal");
  info("STOREFRONT_INGEST_TOKEN in the ERP project's function secrets.");
  process.exit(1);
}

ok(`URL   ${url.replace(/\/\/([a-z0-9]{6})[a-z0-9]*/i, "//$1…")}`);
ok(`Token ${token.length} chars`);

const probe = async (label, headers, body, expect) => {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 10000);
  try {
    const res = await fetch(url, { method: "POST", signal: ctl.signal, headers, body: JSON.stringify(body) });
    const text = await res.text();
    const pass = expect(res.status);
    (pass ? ok : bad)(`${label} → HTTP ${res.status}`);
    if (!pass) info(text.slice(0, 200));
    return pass;
  } catch (e) {
    bad(`${label} → ${e.name === "AbortError" ? "timed out after 10s" : e.message}`);
    return false;
  } finally {
    clearTimeout(t);
  }
};

const json = { "content-type": "application/json" };

// 1. A wrong token must be refused — proves the function is actually guarded.
const authOk = await probe(
  "Rejects a bad token",
  { ...json, authorization: "Bearer definitely-not-the-token" },
  { external_id: "preflight", items: [] },
  (s) => s === 401
);

// 2. The real token with an invalid body must reach validation (400), not auth
//    (401) or a missing function (404). Nothing is written.
const reachOk = await probe(
  "Accepts our token (reaches validation)",
  { ...json, authorization: `Bearer ${token}` },
  { external_id: "preflight", items: [] },
  (s) => s === 400
);

console.log("");
if (authOk && reachOk) {
  console.log("  [32mConnected.[0m Orders placed on the storefront will reach the ERP.\n");
  process.exit(0);
}
console.log("  [31mNot connected.[0m Common causes:\n");
info("401 with our token  → token differs from STOREFRONT_INGEST_TOKEN in the ERP");
info("404                 → function not deployed (supabase functions deploy ingest-storefront-order)");
info("503                 → STOREFRONT_INGEST_TOKEN not set in the ERP's secrets");
console.log("");
process.exit(1);
