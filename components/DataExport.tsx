"use client";

import { useState } from "react";
import { useStore } from "./StoreProvider";

/**
 * "Download your data" — the CCPA/GDPR access right that pairs with account
 * deletion. Fetches the export route and saves it as a JSON file client-side.
 */
export default function DataExport() {
  const { toast } = useStore();
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        toast("Couldn’t prepare your data — please try again.");
        setBusy(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ltfse-account-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast("Your data is downloading.");
    } catch {
      toast("Couldn’t prepare your data — please try again.");
    }
    setBusy(false);
  };

  return (
    <section className="data-export" aria-label="Download your data">
      <h4>Your data</h4>
      <p>
        Download a copy of the personal data we hold for your account — profile, orders, saved
        addresses, project lists and service history — as a JSON file.
      </p>
      <button className="btn btn-line" onClick={download} disabled={busy}>
        {busy ? "Preparing…" : "Download your data"}
      </button>
    </section>
  );
}
