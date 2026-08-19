"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const OPERATOR_ROLES = ["agent", "manager", "admin"];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return setError("Enter a valid email address");
    if (!password) return setError("Enter your password");
    setBusy(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (!res || res.error) return setError("Those credentials didn't match. Please try again.");
    const session = await getSession();
    const role = session?.user?.role;
    const callback = params.get("callbackUrl");
    if (callback) router.push(callback);
    else if (role && OPERATOR_ROLES.includes(role)) router.push("/admin/dashboard");
    else router.push("/account/profile");
    router.refresh();
  }

  return (
    <div className="card auth-card">
      <span className="eyebrow">Welcome back</span>
      <h1 style={{ marginTop: 8 }}>Sign in</h1>
      <p className="muted" style={{ marginTop: 4, marginBottom: 24 }}>
        Applicants and operators sign in here.
      </p>
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input id="email" className="input" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="you@email.com" autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" className="input" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" autoComplete="current-password" />
        </div>
        {error && <div className="err-msg" role="alert"><Icon name="flag" size={14} /> {error}</div>}
        <Button type="submit" variant="primary" size="lg" style={{ width: "100%", marginTop: 8 }} disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="muted" style={{ fontSize: 14, marginTop: 20, textAlign: "center" }}>
        New here? <Link href="/account/register" style={{ color: "var(--verdigris)", fontWeight: 600 }}>Create an account</Link>
      </p>
      <div className="hint" style={{ marginTop: 16, textAlign: "center" }}>
        Demo — applicant: maria@email.com / applicant123 · operator: pm@rentaldepot.example / operator123
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <PublicHeader />
      <div className="wrap" id="main">
        <React.Suspense fallback={<div className="empty-state">Loading…</div>}>
          <LoginForm />
        </React.Suspense>
      </div>
    </>
  );
}
