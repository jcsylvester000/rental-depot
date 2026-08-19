"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useSession } from "@/lib/client/session";

export default function LoginPage() {
  const { login } = useSession();
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return setError("Enter a valid email address");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    login(email);
    router.push("/account/profile");
  }

  return (
    <>
      <PublicHeader />
      <div className="wrap">
        <div className="card auth-card">
          <span className="eyebrow">Welcome back</span>
          <h1 style={{ marginTop: 8 }}>Sign in</h1>
          <p className="muted" style={{ marginTop: 4, marginBottom: 24 }}>
            Track your applications and reuse your details across homes.
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
            <Button type="submit" variant="primary" size="lg" style={{ width: "100%", marginTop: 8 }}>
              Sign in
            </Button>
          </form>
          <p className="muted" style={{ fontSize: 14, marginTop: 20, textAlign: "center" }}>
            New here? <Link href="/account/register" style={{ color: "var(--verdigris)", fontWeight: 600 }}>Create an account</Link>
          </p>
        </div>
      </div>
    </>
  );
}
