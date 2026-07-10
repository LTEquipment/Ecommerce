import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Create account — L&T" };

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="auth"><div className="card">Loading…</div></div>}>
      <AuthForm mode="register" />
    </Suspense>
  );
}
