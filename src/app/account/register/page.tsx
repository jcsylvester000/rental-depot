"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

function strength(pw: string): { pct: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { pct: 10, label: "Too short", color: "var(--clay)" },
    { pct: 35, label: "Weak", color: "var(--clay)" },
    { pct: 60, label: "Fair", color: "var(--amber)" },
    { pct: 80, label: "Good", color: "var(--verdigris)" },
    { pct: 100, label: "Strong", color: "var(--verdigris)" },
  ];
  return map[score];
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const s = strength(password);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Please enter your name");
    if (!email.includes("@")) return setError("Enter a valid email address");
    if (password.length < 8) return setError("Use at least 8 characters");
    setBusy(true);
    const res = await fetch("/api/v1/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: name, email, password }),
    });
    const body = await res.json();
    if (!body.ok) { setBusy(false); return setError(body.error?.message ?? "Could not create your account"); }
    const signRes = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (!signRes || signRes.error) { router.push("/account/login"); return; }
    router.push("/account/profile");
    router.refresh();
  }

  return (
    <>
      <PublicHeader />
      <div className="wrap" id="main">
        <div className="card auth-card">
          <span className="eyebrow">Get started</span>
          <h1 style={{ marginTop: 8 }}>Create your account</h1>
          <p className="muted" style={{ marginTop: 4, marginBottom: 24 }}>
            Save your progress, reuse documents, and track every application.
          </p>
          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" className="input" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="Maria Santos" autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input id="email" className="input" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="you@email.com" autoComplete="email" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" className="input" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="At least 8 characters" autoComplete="new-password" />
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 5, background: "var(--paper-3)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, transition: "width .2s" }} />
                  </div>
                  <div style={{ fontSize: 12, color: s.color, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
                </div>
              )}
            </div>
            {error && <div className="err-msg" role="alert"><Icon name="flag" size={14} /> {error}</div>}
            <Button type="submit" variant="primary" size="lg" style={{ width: "100%", marginTop: 8 }} disabled={busy}>
              {busy ? "Creating…" : "Create account"}
            </Button>
          </form>
          <p className="muted" style={{ fontSize: 14, marginTop: 20, textAlign: "center" }}>
            Already have an account? <Link href="/account/login" style={{ color: "var(--verdigris)", fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
