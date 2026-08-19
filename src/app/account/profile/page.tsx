"use client";

import * as React from "react";
import { AccountShell } from "@/components/layout/AccountShell";
import { Button, LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useSession } from "@/lib/client/session";
import { useToast } from "@/lib/client/toast";

interface Profile {
  phone: string;
  currentAddress: string;
  employer: string;
  position: string;
  grossIncome: string;
}

const KEY = "rd.profile";
const EMPTY: Profile = { phone: "", currentAddress: "", employer: "", position: "", grossIncome: "" };

export default function ProfilePage() {
  const { user, ready } = useSession();
  const { toast } = useToast();
  const [profile, setProfile] = React.useState<Profile>(EMPTY);

  React.useEffect(() => {
    // Hydrate reusable details from localStorage.
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setProfile({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, [user]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      localStorage.setItem(KEY, JSON.stringify(profile));
    } catch {
      /* ignore */
    }
    toast("Profile saved — your next application will pre-fill from this");
  }

  const set = (k: keyof Profile, v: string) => setProfile((p) => ({ ...p, [k]: v }));

  if (ready && !user) {
    return (
      <AccountShell active="/account/profile">
        <SignInPrompt />
      </AccountShell>
    );
  }

  return (
    <AccountShell active="/account/profile">
      <span className="eyebrow">Your account</span>
      <h1 style={{ fontSize: 30, margin: "8px 0 6px" }}>Profile & reusable details</h1>
      <p className="muted" style={{ marginTop: 0, marginBottom: 24, maxWidth: "54ch" }}>
        Stored once, reused everywhere. New applications pre-fill from this, so you apply to your
        next home in minutes.
      </p>

      <form onSubmit={save} className="card" style={{ padding: 26 }}>
        <div className="field-row">
          <div className="field"><label>Full name</label><input className="input" value={user?.fullName ?? ""} disabled /></div>
          <div className="field"><label>Email</label><input className="input" value={user?.email ?? ""} disabled /></div>
        </div>
        <div className="field-row">
          <div className="field"><label>Mobile number</label><input className="input" value={profile.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+63 917 000 0000" /></div>
          <div className="field"><label>Current address</label><input className="input" value={profile.currentAddress} onChange={(e) => set("currentAddress", e.target.value)} placeholder="Street, City" /></div>
        </div>
        <div className="field-row">
          <div className="field"><label>Employer / income source</label><input className="input" value={profile.employer} onChange={(e) => set("employer", e.target.value)} placeholder="Company name" /></div>
          <div className="field"><label>Position</label><input className="input" value={profile.position} onChange={(e) => set("position", e.target.value)} placeholder="Your role" /></div>
        </div>
        <div className="field" style={{ marginBottom: 6 }}>
          <label>Gross monthly income (₱) <span className="why">Why? Kept private; used only to check affordability</span></label>
          <input className="input" type="number" inputMode="numeric" value={profile.grossIncome} onChange={(e) => set("grossIncome", e.target.value)} placeholder="95000" />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <Button type="submit" variant="primary"><Icon name="check" size={16} /> Save details</Button>
          <LinkButton href="/account/documents" variant="ghost">Manage documents</LinkButton>
        </div>
      </form>
    </AccountShell>
  );
}

function SignInPrompt() {
  return (
    <div className="card empty-state">
      <h3>Sign in to view your profile</h3>
      <p>Your reusable details and documents live in your account.</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
        <LinkButton href="/account/login" variant="primary">Sign in</LinkButton>
        <LinkButton href="/account/register" variant="ghost">Create account</LinkButton>
      </div>
    </div>
  );
}
