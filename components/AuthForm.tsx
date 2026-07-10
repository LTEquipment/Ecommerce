"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { signIn, signUp, configured } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "err" | "ok" | "info"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res =
      mode === "login"
        ? await signIn(email, password)
        : await signUp(email, password, company);
    setBusy(false);
    if (res.error) {
      setMsg({ kind: "err", text: res.error });
      return;
    }
    if (mode === "register" && res.needsConfirm) {
      setMsg({ kind: "ok", text: "Account created. Check your email to confirm, then sign in." });
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <div className="auth">
      <div className="card">
        <h1>{mode === "login" ? "Sign in" : "Create trade account"}</h1>
        <p className="sub">
          {mode === "login"
            ? "Access your orders, saved carts and contract pricing."
            : "Open an account for order history, faster checkout and volume pricing."}
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
          <button className="btn btn-primary btn-lg" disabled={busy} type="submit">
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="alt">
          {mode === "login" ? (
            <>New to L&amp;T? <Link href="/register">Create a trade account</Link></>
          ) : (
            <>Already have an account? <Link href="/login">Sign in</Link></>
          )}
        </div>
      </div>
    </div>
  );
}
