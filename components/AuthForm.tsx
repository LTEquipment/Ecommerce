"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";
import Breadcrumbs from "./Breadcrumbs";
import { ILLUS } from "@/lib/illus";
import { safeInternalPath } from "@/lib/safeNext";
import { BACKEND_OFFLINE } from "@/lib/backendMessage";

const BULLETS = [
  "Order history · one-click reorder",
  "Warranty claims · service tickets",
  "Replacement parts, shipped fast",
  "Trade pricing for approved dealers",
];

type Mode = "login" | "register" | "reset";

export default function AuthForm() {
  const { signIn, signUp, resetPassword, resendConfirmation, configured } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  // Only allow internal same-origin paths — never redirect off-site.
  const next = safeInternalPath(params.get("next"));

  const initialMode = params.get("mode");
  const [mode, setMode] = useState<Mode>(initialMode === "register" ? "register" : initialMode === "reset" ? "reset" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [isTrade, setIsTrade] = useState(params.get("trade") === "1");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "err" | "ok" | "info"; text: string } | null>(null);
  const [showResend, setShowResend] = useState(false);

  const go = (m: Mode) => { setMode(m); setMsg(null); setShowResend(false); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    if (mode === "reset") {
      const res = await resetPassword(email);
      setBusy(false);
      if (res.error) return setMsg({ kind: "err", text: res.error });
      setMsg({ kind: "ok", text: "If an account exists for that email, a password-reset link is on its way. Check your inbox (and spam)." });
      return;
    }

    const res =
      mode === "login"
        ? await signIn(email, password)
        : await signUp(email, password, company, isTrade);
    setBusy(false);
    if (res.error) {
      setMsg({ kind: "err", text: res.error });
      return;
    }
    if (mode === "register" && res.needsConfirm) {
      setMsg({
        kind: "ok",
        text: isTrade
          ? "Account created. Check your email to confirm. Your trade pricing unlocks once L&T reviews the account."
          : "Account created. Check your email to confirm, then sign in.",
      });
      setShowResend(true);
      setMode("login");
      return;
    }
    router.push(next);
    router.refresh();
  };

  const resend = async () => {
    setBusy(true);
    const res = await resendConfirmation(email);
    setBusy(false);
    setMsg(res.error ? { kind: "err", text: res.error } : { kind: "ok", text: "Confirmation email re-sent — check your inbox." });
  };

  return (
    <>
      <div className="wrap"><Breadcrumbs items={[{ label: "Sign in" }]} /></div>
      <div className="auth">
        <aside className="brandside">
          <div className="bs-illus" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ILLUS.range }} />
          <div className="bs-top">
            <span className="bs-rule" />
            <span className="bs-kick">Panda&reg; · Made in New York</span>
          </div>
          <div className="bs-cap">
            {/* Decorative brandside caption — a <p>, not a heading, so the page's
                <h1> ("Sign in") remains the first heading in reading order. */}
            <p className="bs-cap-h">Your account,<br />one sign-in.</p>
            <ul>
              {BULLETS.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="card">
          <h1>{mode === "login" ? "Sign in" : mode === "reset" ? "Reset your password" : "Create your account"}</h1>
          <p className="sub">
            {mode === "login"
              ? "Access orders, warranty, service and parts — all in one place."
              : mode === "reset"
              ? "Enter your account email and we'll send a link to set a new password."
              : "One account for orders, warranty, service and parts. Buying for a business? Request trade pricing below."}
          </p>

          {!configured && <div className="msg info" role="status">{BACKEND_OFFLINE}</div>}
          {msg && <div className={`msg ${msg.kind}`} role={msg.kind === "err" ? "alert" : "status"}>{msg.text}</div>}

          <form onSubmit={submit}>
            {mode === "register" && (
              <div className="field">
                <label htmlFor="auth-company">Company / kitchen name</label>
                <input id="auth-company" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Golden Wok LLC" />
              </div>
            )}
            <div className="field">
              <label htmlFor="auth-email">Email</label>
              <input id="auth-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourkitchen.com" />
            </div>
            {mode !== "reset" && (
              <div className="field">
                <div className="field-lbl-row">
                  <label htmlFor="auth-password">Password</label>
                  {mode === "login" && <button type="button" className="linklike field-forgot" onClick={() => go("reset")}>Forgot password?</button>}
                </div>
                <input id="auth-password" type="password" required minLength={6} autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            )}

            {mode === "register" && (
              <label className="trade-check">
                <input type="checkbox" checked={isTrade} onChange={(e) => setIsTrade(e.target.checked)} />
                <span>
                  <b>This is a trade / dealer account</b>
                  <em>Unlock contract pricing after a quick review by L&amp;T.</em>
                </span>
              </label>
            )}

            <button className="btn btn-primary btn-lg" disabled={busy} type="submit">
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : mode === "reset" ? "Send reset link" : "Create account"}
            </button>
          </form>

          {showResend && (
            <div className="alt">
              Didn&apos;t get the email? <button className="linklike" onClick={resend} disabled={busy}>Resend confirmation</button>
            </div>
          )}

          <div className="alt">
            {mode === "login" ? (
              <>New here? <button className="linklike" onClick={() => go("register")}>Create an account</button></>
            ) : mode === "reset" ? (
              <>Remembered it? <button className="linklike" onClick={() => go("login")}>Back to sign in</button></>
            ) : (
              <>Already registered? <button className="linklike" onClick={() => go("login")}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
