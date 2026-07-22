"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null); // recovery session present?
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "err" | "ok"; text: string } | null>(null);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) { setReady(false); return; }
    // The reset link establishes a recovery session; confirm one is present.
    sb.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    const { data: sub } = sb.auth.onAuthStateChange((e) => {
      if (e === "PASSWORD_RECOVERY" || e === "SIGNED_IN") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) return setMsg({ kind: "err", text: "Password must be at least 6 characters." });
    if (pw !== pw2) return setMsg({ kind: "err", text: "Those passwords don’t match." });
    const sb = getBrowserSupabase();
    if (!sb) return;
    setBusy(true);
    setMsg(null);
    const { error } = await sb.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setMsg({ kind: "err", text: error.message });
    setMsg({ kind: "ok", text: "Password updated. Taking you to your account…" });
    setTimeout(() => { router.push("/account"); router.refresh(); }, 1200);
  };

  return (
    <div className="auth auth-solo">
      <div className="card">
        <h1>Set a new password</h1>
        {ready === false ? (
          <>
            <p className="sub">Open this page from the reset link in your email. If the link expired or you arrived another way, request a new one.</p>
            {msg && <div className={`msg ${msg.kind}`}>{msg.text}</div>}
            <Link className="btn btn-line btn-block" href="/login?mode=reset">Request a reset link</Link>
          </>
        ) : ready === null ? (
          <p className="sub">Checking your reset link…</p>
        ) : (
          <>
            <p className="sub">Choose a new password for your account.</p>
            {msg && <div className={`msg ${msg.kind}`}>{msg.text}</div>}
            <form onSubmit={submit}>
              <div className="field"><label htmlFor="rp-new-password">New password</label><input id="rp-new-password" type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" /></div>
              <div className="field"><label htmlFor="rp-confirm-password">Confirm password</label><input id="rp-confirm-password" type="password" required minLength={6} value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="••••••••" /></div>
              <button className="btn btn-primary btn-lg" disabled={busy} type="submit">{busy ? "Saving…" : "Update password"}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
