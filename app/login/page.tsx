import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Sign in — L&T" };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth"><div className="card">Loading…</div></div>}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
