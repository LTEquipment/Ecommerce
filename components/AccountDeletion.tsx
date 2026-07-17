"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { useStore } from "./StoreProvider";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { COMPANY } from "@/lib/company";

type Req = { id: string; status: string; created_at: string };

const OPEN = ["pending", "processing"];
const fmt = (iso: string) => {
  try { return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }); }
  catch { return ""; }
};

/**
 * "Delete account" danger zone. Records a REQUEST to close the account (staff
 * process it manually — nothing is deleted client-side). Degrades gracefully to
 * an email fallback when the account-deletion migration hasn't been run yet.
 */
export default function AccountDeletion() {
  const { user } = useAuth();
  const { toast } = useStore();
  const [req, setReq] = useState<Req | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb || !user) { setLoaded(true); return; }
    sb.from("account_deletion_requests")
      .select("id, status, created_at")
      .eq("user_id", user.id)
      .in("status", OPEN)
      .maybeSingle()
      .then(({ data }) => { setReq((data as Req) ?? null); setLoaded(true); });
  }, [user]);

  const submit = async () => {
    setBusy(true);
    const res = await fetch("/api/account/deletion-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      toast(d.notEnabled
        ? `Online deletion isn't available yet — email ${COMPANY.email} and we'll close your account.`
        : (d.error || "Could not submit your request."));
      return;
    }
    setReq(d.request ?? { id: "", status: "pending", created_at: new Date().toISOString() });
    setConfirming(false);
    setReason("");
    toast("Deletion requested. Our team will follow up by email.");
  };

  const cancel = async () => {
    setBusy(true);
    const res = await fetch("/api/account/deletion-request", { method: "DELETE" });
    setBusy(false);
    if (!res.ok) { toast("Couldn’t cancel — please try again."); return; }
    setReq(null);
    toast("Your deletion request was cancelled.");
  };

  if (!loaded) return null;

  return (
    <section className="danger-zone" aria-label="Delete account">
      <h4>Delete account</h4>

      {req ? (
        <div className="dz-pending">
          <p>
            <b>Deletion requested {fmt(req.created_at)}.</b> Your request is {req.status === "processing" ? "being processed" : "in our queue"}.
            We’ll email you as it’s handled. You can cancel until it’s processed.
          </p>
          <button className="btn btn-line dz-cancel" onClick={cancel} disabled={busy}>
            {busy ? "Cancelling…" : "Cancel deletion request"}
          </button>
        </div>
      ) : confirming ? (
        <div className="dz-confirm">
          <p>
            This asks our team to close your account and remove your personal data. Completed orders and
            invoices are kept where tax and warranty law requires. This can’t be undone once processed —
            you’ll get an email confirmation and can cancel before then.
          </p>
          <label htmlFor="dz-reason" className="dz-reason-lbl">Reason (optional — helps us improve)</label>
          <textarea
            id="dz-reason"
            className="dz-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Anything you'd like us to know…"
          />
          <div className="dz-actions">
            <button className="btn dz-delete" onClick={submit} disabled={busy}>
              {busy ? "Submitting…" : "Confirm deletion request"}
            </button>
            <button className="btn btn-line" onClick={() => { setConfirming(false); setReason(""); }} disabled={busy}>
              Keep my account
            </button>
          </div>
        </div>
      ) : (
        <div className="dz-intro">
          <p>
            Close your account and request removal of your personal data. It’s a reviewed request, not an
            instant delete — we’ll confirm by email, and some records are retained where the law requires.
          </p>
          <button className="btn btn-line dz-trigger" onClick={() => setConfirming(true)}>
            Request account deletion
          </button>
        </div>
      )}
    </section>
  );
}
