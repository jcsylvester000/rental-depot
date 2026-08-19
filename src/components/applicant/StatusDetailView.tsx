"use client";

import * as React from "react";
import type { ApplicationDetail, Message, DocumentRequest, Lease, Payment } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { formatDateTime, formatDate } from "@/lib/format";
import { STATUS_EXPLANATION } from "@/lib/status-display";
import { StatusTimeline } from "@/components/applicant/StatusTimeline";
import { StatusStamp } from "@/components/ui/Stamp";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/lib/client/toast";

export function StatusDetailView({ initial }: { initial: ApplicationDetail }) {
  const { toast } = useToast();
  const ref = initial.reference;
  const [messages, setMessages] = React.useState<Message[]>(initial.messages);
  const [requests, setRequests] = React.useState<DocumentRequest[]>(initial.documentRequests);
  const [lease, setLease] = React.useState<Lease | undefined>(initial.lease);
  const [payments, setPayments] = React.useState<Payment[]>(initial.payments);
  const [draft, setDraft] = React.useState("");
  const explain = STATUS_EXPLANATION[initial.status];

  async function send() {
    if (!draft.trim()) return;
    const body = draft.trim();
    setDraft("");
    const res = await fetch(`/api/v1/applications/${ref}/messages`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }),
    });
    const j = await res.json();
    if (j.ok) setMessages((m) => [...m, j.data]);
  }

  async function resubmit(req: DocumentRequest) {
    const res = await fetch(`/api/v1/applications/${ref}/documents`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: req.id }),
    });
    const j = await res.json();
    if (j.ok) {
      setRequests((rs) => rs.map((r) => (r.id === req.id ? { ...r, status: "fulfilled" as const } : r)));
      toast("Document submitted — thank you");
    }
  }

  async function sign(payDeposit: boolean) {
    const res = await fetch(`/api/v1/applications/${ref}/lease`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payDeposit }),
    });
    const j = await res.json();
    if (j.ok) {
      setLease(j.data);
      if (payDeposit) setPayments((ps) => ps.map((p) => (p.type === "deposit" ? { ...p, status: "paid" as const } : p)));
      toast(payDeposit ? "Lease signed and deposit paid — welcome home!" : "Lease signed");
    }
  }

  const openRequests = requests.filter((r) => r.status === "open");
  const deposit = payments.find((p) => p.type === "deposit");
  const showLease = (initial.status === "approved" || initial.status === "conditional") && lease;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, maxWidth: 760 }}>
      {/* header */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div>
            <div className="mono muted" style={{ fontSize: 12 }}>{ref}</div>
            <h2 style={{ fontSize: 22, marginTop: 4 }}>{initial.unit.title}</h2>
            <div className="muted" style={{ fontSize: 14 }}>{formatMoney(initial.unit.rent)}/mo · {initial.unit.code}</div>
          </div>
          <StatusStamp status={initial.status} />
        </div>
        <div className="trust-note" style={{ marginTop: 18 }}>
          <span className="tn-ic"><Icon name="shield" size={16} /></span>
          <div><b>{explain.headline}.</b> {explain.detail}</div>
        </div>
      </div>

      {/* action needed: document requests */}
      {openRequests.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 17, marginBottom: 6 }}>Action needed</h3>
          <p className="muted" style={{ fontSize: 13, marginTop: 0, marginBottom: 14 }}>Respond here without restarting your application.</p>
          {openRequests.map((r) => (
            <div key={r.id} className="request-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{r.label}</div>
                  <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 3 }}>{r.reason}</div>
                </div>
                <Button variant="accent" size="sm" onClick={() => resubmit(r)}><Icon name="upload" size={14} /> Upload</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {requests.some((r) => r.status === "fulfilled") && openRequests.length === 0 && (
        <div className="request-card done">
          <Icon name="check" size={15} /> Thanks — your document was received and is being reviewed.
        </div>
      )}

      {/* timeline */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 17, marginBottom: 16 }}>Progress</h3>
        <StatusTimeline status={initial.status} />
      </div>

      {/* lease signing & onboarding */}
      {showLease && lease && (
        <div className="card lease-card">
          <h3 style={{ fontSize: 18 }}>Your lease</h3>
          <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>Review the agreement, sign, and pay your deposit to secure the home.</p>
          <div className="lease-doc">
            <p><b>Residential Lease Agreement</b></p>
            <p>Unit {initial.unit.code} — {initial.unit.title}. Term: {lease.termMonths} months from {formatDate(lease.startDate)}. Monthly rent {formatMoney(lease.rent)}, due on the 1st. Security deposit {formatMoney(lease.deposit)}.</p>
            <p>The tenant agrees to the house rules, timely rent, and care of the premises. The landlord agrees to provide the unit in habitable condition and to the quiet enjoyment of the tenant. Standard clauses on maintenance, notice, and renewal apply.</p>
            <p className="muted">This is a demo lease summary. Full clause configuration is set by the operator.</p>
          </div>
          <div className="onboard-grid">
            <div className="onboard-item"><div className="oi-label">Move-in date</div><div className="oi-val">{formatDate(lease.startDate)}</div></div>
            <div className="onboard-item"><div className="oi-label">Deposit</div><div className="oi-val">{formatMoney(lease.deposit)} {deposit?.status === "paid" ? "· Paid" : "· Due on signing"}</div></div>
            <div className="onboard-item"><div className="oi-label">Keys & contact</div><div className="oi-val">Handover at the property office</div></div>
            <div className="onboard-item"><div className="oi-label">Documents</div><div className="oi-val">Carried into your tenancy record</div></div>
          </div>
          {lease.signedByApplicant ? (
            <div className="request-card done" style={{ marginTop: 16 }}>
              <Icon name="check" size={15} /> Lease signed{deposit?.status === "paid" ? " and deposit paid — you're all set. Welcome home!" : ". Pay your deposit to finish."}
              {deposit?.status !== "paid" && (
                <div style={{ marginTop: 10 }}>
                  <Button variant="accent" size="sm" onClick={() => sign(true)}>Pay deposit {formatMoney(lease.deposit)}</Button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <Button variant="accent" onClick={() => sign(false)}><Icon name="check" size={16} /> Review complete — sign lease</Button>
              <Button variant="primary" onClick={() => sign(true)}>Sign & pay deposit</Button>
            </div>
          )}
        </div>
      )}

      {/* messages */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 17, marginBottom: 14 }}>Messages</h3>
        <div className="thread">
          {messages.length === 0 && <p className="muted" style={{ fontSize: 13, textAlign: "center" }}>No messages yet.</p>}
          {messages.map((m) => (
            <div key={m.id} className={`bubble ${m.from === "applicant" ? "me" : m.from === "system" ? "sys" : "them"}`}>
              {m.from !== "system" && <div className="b-meta">{m.from === "applicant" ? "You" : m.authorName ?? "Operator"} · {formatDateTime(m.createdAt)}</div>}
              {m.body}
            </div>
          ))}
        </div>
        <div className="thread-input">
          <input className="input" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Write a message to the property manager…" />
          <Button variant="primary" onClick={send} disabled={!draft.trim()}><Icon name="msg" size={15} /> Send</Button>
        </div>
      </div>

      {/* notification preferences */}
      <NotificationPrefs />
    </div>
  );
}

function NotificationPrefs() {
  const { toast } = useToast();
  const [prefs, setPrefs] = React.useState({ email: true, sms: true, inApp: true });
  const rows: { key: keyof typeof prefs; label: string; hint: string }[] = [
    { key: "email", label: "Email", hint: "Decisions, requests, and confirmations" },
    { key: "sms", label: "SMS", hint: "Time-sensitive updates" },
    { key: "inApp", label: "In-app", hint: "Everything, in your account" },
  ];
  return (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 17, marginBottom: 4 }}>Notification preferences</h3>
      <p className="muted" style={{ fontSize: 13, marginTop: 0, marginBottom: 8 }}>Choose how we keep you updated.</p>
      {rows.map((r) => (
        <div key={r.key} className="pref-row">
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{r.label}</div>
            <div className="muted" style={{ fontSize: 12 }}>{r.hint}</div>
          </div>
          <label className="check-row" style={{ padding: 0 }}>
            <input
              type="checkbox"
              checked={prefs[r.key]}
              onChange={(e) => { setPrefs((p) => ({ ...p, [r.key]: e.target.checked })); toast("Preferences updated"); }}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
