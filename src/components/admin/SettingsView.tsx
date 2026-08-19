"use client";

import * as React from "react";
import type { AppSettings, User } from "@/lib/types";
import { USER_ROLES } from "@/lib/types";
import { formatMoney, money } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Stamp } from "@/components/ui/Stamp";
import { useToast } from "@/lib/client/toast";

const TABS = ["Screening rules", "Fees & criteria", "Templates", "Branding", "Team & roles", "Integrations"] as const;
type Tab = (typeof TABS)[number];

export function SettingsView({ settings: initial, users: initialUsers, properties }: {
  settings: AppSettings; users: User[]; properties: { id: string; name: string }[];
}) {
  const { toast } = useToast();
  const [tab, setTab] = React.useState<Tab>("Screening rules");
  const [settings, setSettings] = React.useState(initial);
  const [users, setUsers] = React.useState(initialUsers);

  async function save(patch: Partial<AppSettings>, msg = "Settings saved") {
    const r = await fetch("/api/v1/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    const j = await r.json();
    if (j.ok) { setSettings(j.data); toast(msg); }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20, borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
        {TABS.map((t) => (
          <button key={t} className="chip-toggle" aria-pressed={tab === t} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "Screening rules" && <ScreeningRulesForm settings={settings} onSave={save} />}
      {tab === "Fees & criteria" && <FeesForm settings={settings} onSave={save} />}
      {tab === "Templates" && <TemplatesForm settings={settings} onSave={save} />}
      {tab === "Branding" && <BrandingForm settings={settings} onSave={save} />}
      {tab === "Team & roles" && <TeamForm users={users} properties={properties} onAdd={(u) => setUsers((us) => [...us, u])} />}
      {tab === "Integrations" && <IntegrationsForm settings={settings} onSave={save} />}
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="card app-form-card" style={{ maxWidth: 640 }}>
      <h3 style={{ fontSize: 17, marginBottom: 4 }}>{title}</h3>
      {desc && <p className="muted" style={{ fontSize: 13, marginTop: 0, marginBottom: 16 }}>{desc}</p>}
      {children}
    </div>
  );
}

function ScreeningRulesForm({ settings, onSave }: { settings: AppSettings; onSave: (p: Partial<AppSettings>) => void }) {
  const [s, setS] = React.useState(settings.screening);
  return (
    <Section title="Automated screening rules" desc="Pre-classify applicants against configurable, jurisdiction-aware thresholds. Rules flag for human review — they never auto-decline.">
      <div className="field-row">
        <div className="field"><label>Income-to-rent multiple</label><input type="number" step="0.5" className="input" value={s.incomeMultiple} onChange={(e) => setS({ ...s, incomeMultiple: Number(e.target.value) })} /></div>
        <div className="field"><label>Minimum credit score</label><input type="number" className="input" value={s.minCreditScore} onChange={(e) => setS({ ...s, minCreditScore: Number(e.target.value) })} /></div>
      </div>
      <label className="pref-row"><span><b style={{ fontSize: 14 }}>Flag, don't auto-reject</b><div className="muted" style={{ fontSize: 12 }}>Surface for human review instead of silent decline</div></span><input type="checkbox" checked={s.flagNotReject} onChange={(e) => setS({ ...s, flagNotReject: e.target.checked })} /></label>
      <label className="pref-row"><span><b style={{ fontSize: 14 }}>Require consent before screening</b><div className="muted" style={{ fontSize: 12 }}>Block screening until consent is recorded</div></span><input type="checkbox" checked={s.requireConsentBeforeScreening} onChange={(e) => setS({ ...s, requireConsentBeforeScreening: e.target.checked })} /></label>
      <Button variant="primary" style={{ marginTop: 14 }} onClick={() => onSave({ screening: s })}><Icon name="check" size={16} /> Save rules</Button>
    </Section>
  );
}

function FeesForm({ settings, onSave }: { settings: AppSettings; onSave: (p: Partial<AppSettings>, m?: string) => void }) {
  const [fee, setFee] = React.useState(String(settings.applicationFee.amountMinor / 100));
  const [note, setNote] = React.useState(settings.jurisdictionNote);
  return (
    <Section title="Fees & criteria" desc="Set the application fee. Where a jurisdiction caps or prohibits it, the amount is adjusted automatically for applicants.">
      <div className="field"><label>Application fee (₱)</label><input type="number" className="input" value={fee} onChange={(e) => setFee(e.target.value)} /><div className="hint">Shown to applicants before payment: {formatMoney(money(Number(fee) * 100))}.</div></div>
      <div className="field"><label>Jurisdiction note</label><textarea className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></div>
      <Button variant="primary" onClick={() => onSave({ applicationFee: money(Number(fee) * 100), jurisdictionNote: note })}><Icon name="check" size={16} /> Save</Button>
    </Section>
  );
}

function TemplatesForm({ settings, onSave }: { settings: AppSettings; onSave: (p: Partial<AppSettings>, m?: string) => void }) {
  const [templates, setTemplates] = React.useState(settings.templates);
  const [clauses, setClauses] = React.useState(settings.leaseClauses);
  const upd = (i: number, body: string) => setTemplates((t) => t.map((x, idx) => (idx === i ? { ...x, body } : x)));
  return (
    <Section title="Message & lease templates" desc="Reusable messages for common steps, and the default lease clauses used when generating a lease.">
      {templates.map((t, i) => (
        <div key={t.id} className="field"><label>{t.name}</label><textarea className="input" rows={2} value={t.body} onChange={(e) => upd(i, e.target.value)} /></div>
      ))}
      <div className="field"><label>Default lease clauses</label><textarea className="input" rows={4} value={clauses} onChange={(e) => setClauses(e.target.value)} /></div>
      <Button variant="primary" onClick={() => onSave({ templates, leaseClauses: clauses }, "Templates saved")}><Icon name="check" size={16} /> Save templates</Button>
    </Section>
  );
}

function BrandingForm({ settings, onSave }: { settings: AppSettings; onSave: (p: Partial<AppSettings>, m?: string) => void }) {
  const [b, setB] = React.useState(settings.branding);
  return (
    <Section title="Branding" desc="Tailor the applicant-facing name, accent colour, and intro copy.">
      <div className="field"><label>Product name</label><input className="input" value={b.productName} onChange={(e) => setB({ ...b, productName: e.target.value })} /></div>
      <div className="field"><label>Accent colour</label><input type="color" className="input" style={{ height: 44, padding: 4, width: 80 }} value={b.accent} onChange={(e) => setB({ ...b, accent: e.target.value })} /></div>
      <div className="field"><label>Applicant intro</label><textarea className="input" rows={2} value={b.applicantIntro} onChange={(e) => setB({ ...b, applicantIntro: e.target.value })} /></div>
      <Button variant="primary" onClick={() => onSave({ branding: b }, "Branding saved")}><Icon name="check" size={16} /> Save branding</Button>
    </Section>
  );
}

function TeamForm({ users, properties, onAdd }: { users: User[]; properties: { id: string; name: string }[]; onAdd: (u: User) => void }) {
  const { toast } = useToast();
  const [form, setForm] = React.useState({ name: "", email: "", role: "agent" as User["role"] });
  async function add() {
    const r = await fetch("/api/v1/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const j = await r.json();
    if (j.ok) { onAdd(j.data); setForm({ name: "", email: "", role: "agent" }); toast("Team member added"); }
    else toast(j.error?.message ?? "Failed");
  }
  return (
    <Section title="Team, roles & permissions" desc="Control who can see and do what. Sensitive financial and ID data is scoped by role; operators can be limited to specific properties.">
      <div className="block" style={{ marginBottom: 18 }}>
        <table className="qtable">
          <thead><tr><th>Member</th><th>Role</th><th>Property scope</th><th>Sensitive data</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><div className="q-name">{u.name}</div><div className="q-sub">{u.email}</div></td>
                <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                <td className="q-sub">{u.propertyIds.length ? u.propertyIds.map((id) => properties.find((p) => p.id === id)?.name ?? id).join(", ") : "All properties"}</td>
                <td>{u.role === "agent" ? <Stamp variant="review">Limited</Stamp> : <Stamp variant="approved">Full</Stamp>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="field-row">
        <div className="field"><label>Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="field"><label>Email</label><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
      </div>
      <div className="field"><label>Role</label><select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as User["role"] })}>{USER_ROLES.filter((r) => r !== "applicant").map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
      <Button variant="primary" onClick={add} disabled={!form.name || !form.email}><Icon name="plus" size={16} /> Add member</Button>
    </Section>
  );
}

function IntegrationsForm({ settings, onSave }: { settings: AppSettings; onSave: (p: Partial<AppSettings>, m?: string) => void }) {
  const [integrations, setIntegrations] = React.useState(settings.integrations);
  function toggle(key: string) {
    const next = integrations.map((i) => (i.key === key ? { ...i, connected: !i.connected } : i));
    setIntegrations(next);
    onSave({ integrations: next }, "Integration updated");
  }
  return (
    <div style={{ maxWidth: 720 }}>
      <Section title="Integrations & payments" desc="Manage the external services the system relies on, and reconcile money in and out.">
        <div style={{ display: "grid", gap: 12 }}>
          {integrations.map((i) => (
            <div key={i.key} className="doc-locker-item" style={{ marginBottom: 0 }}>
              <span className="dl-ic"><Icon name={i.category === "payments" ? "chart" : i.category === "esign" ? "doc" : i.category === "portal" ? "building" : "shield"} size={18} /></span>
              <div style={{ flex: 1 }}><div className="dl-name">{i.name}</div><div className="dl-meta">{i.detail}</div></div>
              {i.connected ? <Stamp variant="approved">Connected</Stamp> : <Stamp variant="received">Off</Stamp>}
              <Button variant="ghost" size="sm" onClick={() => toggle(i.key)}>{i.connected ? "Disconnect" : "Connect"}</Button>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--line)", margin: "18px 0" }} />
        <h4 style={{ fontSize: 14, marginBottom: 10 }}>Payment reconciliation</h4>
        <div className="stat-tiles" style={{ marginBottom: 0 }}>
          <div className="screen-item"><div className="si-label">Fees collected</div><div className="si-val">₱200</div><div className="si-note">2 applications</div></div>
          <div className="screen-item"><div className="si-label">Deposits pending</div><div className="si-val">₱70,000</div><div className="si-note">1 lease</div></div>
          <div className="screen-item"><div className="si-label">API key</div><div className="si-val mono" style={{ fontSize: 15 }}>rd_live_••••</div><div className="si-note">Rotate in security</div></div>
        </div>
      </Section>
    </div>
  );
}
