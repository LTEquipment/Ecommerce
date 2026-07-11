"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";
import Breadcrumbs from "./Breadcrumbs";
import { ILLUS } from "@/lib/illus";

const BULLETS = [
  "Order history · one-click reorder",
  "Warranty claims · service tickets",
  "Replacement parts, shipped fast",
  "Trade pricing for approved dealers",
];

export default function AuthForm() {
  const { signIn, signUp, configured } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";

  const [mode, setMode] = useState<"login" | "register">(
    params.get("mode") === "register" ? "register" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [isTrade, setIsTrade] = useState(params.get("trade") === "1");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "err" | "ok" | "info"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
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
      setMode("login");
      return;
    }
    router.push(next);
    router.refresh();
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
            <h2>Your account,<br />one sign-in.</h2>
            <ul>
              {BULLETS.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="card">
          <h1>{mode === "login" ? "Sign in" : "Create your account"}</h1>
          <p className="sub">
            {mode === "login"
              ? "Access orders, warranty, service and parts — all in one place."
              : "One account for orders, warranty, service and parts. Buying for a business? Request trade pricing below."}
          </p>

          {!configured && (
            <div className="msg info">
              Backend not connected in this environment. Add Supabase keys to <b>.env.local</b> to
              enable sign-in (see README).
            </div>
          )}
          {msg && <div className={`msg ${msg.kind}`}>{msg.text}</div>}

          <form onSubmit={submit}>
            {mode === "register" && (
              <div className="field">
                <label>Company / kitchen name</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Golden Wok LLC" />
              </div>
            )}
            <div className="field">
              <label>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourkitchen.com" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

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
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="alt">
            {mode === "login" ? (
              <>New here? <button className="linklike" onClick={() => setMode("register")}>Create an account</button></>
            ) : (
              <>Already registered? <button className="linklike" onClick={() => setMode("login")}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
