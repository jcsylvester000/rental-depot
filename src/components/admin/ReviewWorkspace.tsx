"use client";

import * as React from "react";
import type { ApplicationDetail, ScreeningResult, Decision, OperatorNote, ApplicationStatus } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/format";
import { StatusStamp, Stamp } from "@/components/ui/Stamp";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/lib/client/toast";

const REASONS = [
  { code: "meets_criteria", label: "Meets all criteria" },
  { code: "income_below", label: "Income below threshold" },
  { code: "credit_below", label: "Credit below minimum" },
  { code: "eviction_history", label: "Prior eviction" },
  { code: "incomplete", label: "Incomplete / unverifiable" },
  { code: "other", label: "Other (see note)" },
];

const outcomeInitials = (name: string) => name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export function ReviewWorkspace({ initial }: { initial: ApplicationDetail }) {
  const { toast } = useToast();
  const ref = initial.reference;
  const [status, setStatus] = React.useState<ApplicationStatus>(initial.status);
  const [screening, setScreening] = React.useState<ScreeningResult | undefined>(initial.screening);
  const [decision, setDecision] = React.useState<Decision | undefined>(initial.decision);
  const [notes, setNotes] = React.useState<OperatorNote[]>(initial.notes);
  const [reasonCode, setReasonCode] = React.useState("meets_criteria");
  const [noteDraft, setNoteDraft] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const rubric = initial.rubric;
  const isBusiness = initial.applicantType === "business";
  const isCommercial = initial.unit.propertyClass === "commercial";

  async function runScreening() {
    setBusy(true);
    try {
      const r = await fetch(`/api/v1/admin/applications/${ref}/screening`, { method: "POST" });
      const j = await r.json();
      if (j.ok) { setScreening(j.data); if (status === "new" || status === "screening") setStatus("complete"); toast("Screening complete"); }
    } finally { setBusy(false); }
  }

  async function decide(outcome: "approve" | "conditional" | "decline") {
    if (outcome === "decline" && reasonCode === "meets_criteria") { toast("Choose a decline reason first"); return; }
    setBusy(true);
    try {
      const r = await fetch(`/api/v1/admin/applications/${ref}/decision`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome, reasonCode, reasonText: noteDraft || undefined }),
      });
      const j = await r.json();
      if (j.ok) {
        setDecision(j.data);
        setStatus(outcome === "approve" ? "approved" : outcome === "conditional" ? "conditional" : "declined");
        toast(outcome === "decline" ? "Decision recorded — adverse-action notice generated" : "Decision recorded");
      } else toast(j.error?.message ?? "Failed");
    } finally { setBusy(false); }
  }

  async function requestDoc() {
    const label = prompt("Which document do you need?");
    if (!label) return;
    const r = await fetch(`/api/v1/admin/applications/${ref}/request-document`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docType: "other", label, reason: "Needed to continue your application." }),
    });
    const j = await r.json();
    if (j.ok) { setStatus("incomplete"); toast("Document requested from applicant"); }
  }

  async function addNote() {
    if (!noteDraft.trim()) return;
    const r = await fetch(`/api/v1/admin/applications/${ref}/notes`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: noteDraft }),
    });
    const j = await r.json();
    if (j.ok) { setNotes((n) => [j.data, ...n]); setNoteDraft(""); toast("Note added"); }
  }

  const screenItems = screening ? [
    { label: "Credit", stamp: outcomeStamp(screening.creditOutcome), val: screening.creditScore ?? "—", note: "Payment history & tradelines." },
    { label: "Income-to-rent", stamp: outcomeStamp(screening.incomeOutcome), val: screening.incomeToRent ? `${screening.incomeToRent}×` : "—", note: "Verified against documents." },
    { label: "Background", stamp: outcomeStamp(screening.backgroundOutcome), val: cap(screening.backgroundOutcome), note: "Within lawful scope." },
    { label: "Eviction", stamp: outcomeStamp(screening.evictionOutcome), val: cap(screening.evictionOutcome), note: "Prior filings." },
  ] : [];

  return (
    <div className="rev-layout">
      <div>
        <div className="applicant-head">
          <div className="av-lg">{outcomeInitials(initial.applicant.fullName)}</div>
          <div className="ah-info">
            <h2>{isBusiness && initial.businessName ? initial.businessName : initial.applicant.fullName}{isBusiness && <span className="pill accent" style={{ marginLeft: 8, fontSize: 11, verticalAlign: "middle" }}>Business</span>}</h2>
            <div className="ah-meta">
              <span className="mono">{initial.reference}</span>
              <span><Icon name="building" size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> {initial.unit.code}{isCommercial ? " · Commercial" : ""}</span>
              <span><Icon name="clock" size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> {formatDate(initial.submittedAt)}</span>
            </div>
          </div>
          <div className="ah-actions"><StatusStamp status={status} /></div>
        </div>

        {/* business details (commercial) */}
        {isBusiness && (
          <div className="block" style={{ marginBottom: 20 }}>
            <div className="block-head"><h3>Business details</h3><span className="muted" style={{ fontSize: 13 }}>Commercial tenant</span></div>
            <div className="block-body">
              <div className="rb-body" style={{ padding: 0 }}>
                <div className="r"><span>Registered name</span>{initial.businessName ?? "—"}</div>
                <div className="r"><span>Entity type</span>{initial.businessType ?? "—"}</div>
                <div className="r"><span>Nature of business</span>{initial.natureOfBusiness ?? "—"}</div>
                <div className="r"><span>Years operating</span>{initial.yearsOperating != null ? `${initial.yearsOperating} yr${initial.yearsOperating === 1 ? "" : "s"}` : "—"}</div>
                <div className="r"><span>Intended use</span>{initial.intendedUse ?? "—"}</div>
                {initial.unit.permittedUse && <div className="r"><span>Unit permitted use</span>{initial.unit.permittedUse}</div>}
                <div className="r"><span>Primary contact</span>{initial.applicant.fullName}</div>
              </div>
            </div>
          </div>
        )}

        {/* screening */}
        <div className="block" style={{ marginBottom: 20 }}>
          <div className="block-head">
            <h3>Screening results</h3>
            {initial.consentGivenAt ? <span className="pill accent"><Icon name="check" size={13} /> Consent on file · {formatDate(initial.consentGivenAt)}</span> : <span className="pill">No consent</span>}
          </div>
          <div className="block-body">
            {screening ? (
              <div className="screen-grid">
                {screenItems.map((s) => (
                  <div key={s.label} className="screen-item">
                    <div className="si-label">{s.label} <Stamp variant={s.stamp.variant} className="" >{s.stamp.label}</Stamp></div>
                    <div className="si-val">{s.val}</div>
                    <div className="si-note">{s.note}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>{initial.consentGivenAt ? "Screening hasn't run yet." : "Consent must be on file before screening."}</p>
                <Button variant="accent" onClick={runScreening} disabled={busy || !initial.consentGivenAt}><Icon name="shield" size={16} /> Run screening</Button>
              </div>
            )}
          </div>
        </div>

        {/* rubric */}
        {rubric && (
          <div className="block" style={{ marginBottom: 20 }}>
            <div className="block-head"><h3>Scoring rubric</h3><span className={`score-chip ${rubric.overall >= 80 ? "good" : ""}`}>Overall {rubric.overall}</span></div>
            <div className="block-body">
              <div className="rubric">
                {[["Income stability", rubric.incomeStability], ["Credit history", rubric.creditHistory], ["Rental history", rubric.rentalHistory], ["Completeness", rubric.completeness]].map(([label, val]) => (
                  <div key={label as string} className="rubric-row">
                    <div className="rr-label">{label}</div>
                    <div className="rr-bar"><i style={{ width: `${val}%`, background: "var(--verdigris)" }} /></div>
                    <div className="rr-score">{val}</div>
                  </div>
                ))}
              </div>
              <p className="muted" style={{ fontSize: 12, marginTop: 14 }}>The same rubric is applied to every applicant for this unit. Protected attributes are never scored.</p>
            </div>
          </div>
        )}

        {/* documents */}
        <div className="block" style={{ marginBottom: 20 }}>
          <div className="block-head"><h3>Documents</h3><span className="muted" style={{ fontSize: 13 }}>{initial.documents.length} on file</span></div>
          <div className="block-body">
            {initial.documents.length ? (
              <div className="doc-viewer">
                {initial.documents.map((d) => {
                  const isImg = !!d.assetRef && /\.(jpe?g|png|webp|gif|heic|heif)(\?|$)/i.test(d.assetRef);
                  if (d.assetRef) {
                    return (
                      <a key={d.id} className="doc-thumb" href={d.assetRef} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <div className="dt-ph">{isImg ? <img src={d.assetRef} alt={d.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="file" size={26} />}</div>
                        <div className="dt-name">{d.label}</div>
                      </a>
                    );
                  }
                  return (
                    <div key={d.id} className="doc-thumb" onClick={() => toast("No file attached (seeded record)")}>
                      <div className="dt-ph"><Icon name="file" size={26} /></div>
                      <div className="dt-name">{d.label}</div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="muted" style={{ fontSize: 14, margin: 0 }}>No documents uploaded yet.</p>}
          </div>
        </div>

        {/* application details */}
        <div className="block">
          <div className="block-head"><h3>Application details</h3></div>
          <div className="block-body">
            <div className="rb-body" style={{ padding: 0 }}>
              {isBusiness ? (
                <>
                  <div className="r"><span>Business</span>{initial.businessName ?? "—"}</div>
                  <div className="r"><span>Monthly revenue</span>{initial.applicant.grossMonthlyIncome ? `${formatMoney(initial.applicant.grossMonthlyIncome)} / mo` : "—"}</div>
                  <div className="r"><span>Contact</span>{initial.applicant.fullName}</div>
                  <div className="r"><span>Lease term</span>{initial.leaseTermMonths ? `${initial.leaseTermMonths} months` : "—"}</div>
                  <div className="r"><span>Desired move-in</span>{formatDate(initial.desiredMoveIn)}</div>
                  <div className="r"><span>Fee</span>{initial.feeStatus === "paid" ? "Paid" : "Pending"}</div>
                </>
              ) : (
                <>
                  <div className="r"><span>Employer</span>{initial.applicant.employer ?? "—"}</div>
                  <div className="r"><span>Position</span>{initial.applicant.position ?? "—"}</div>
                  <div className="r"><span>Gross income</span>{initial.applicant.grossMonthlyIncome ? `${formatMoney(initial.applicant.grossMonthlyIncome)} / mo` : "—"}</div>
                  <div className="r"><span>Current address</span>{initial.applicant.currentAddress ?? "—"}</div>
                  <div className="r"><span>Desired move-in</span>{formatDate(initial.desiredMoveIn)}</div>
                  <div className="r"><span>Fee</span>{initial.feeStatus === "paid" ? "Paid" : "Pending"}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* decision panel */}
      <div>
        <div className="decision-panel">
          <h3 style={{ fontSize: 17 }}>Make a decision</h3>
          <p className="dp-sub">Consistent criteria, recorded to the audit trail.</p>

          {decision ? (
            <div className="request-card done" style={{ marginBottom: 14 }}>
              <b style={{ textTransform: "capitalize" }}>{decision.outcome}</b> recorded · {formatDateTime(decision.decidedAt)}
              {decision.adverseActionIssued && <div style={{ marginTop: 6, fontSize: 12 }}>Adverse-action notice generated.</div>}
            </div>
          ) : null}

          <div className="field" style={{ marginBottom: 12 }}>
            <label>Reason</label>
            <select className="select" value={reasonCode} onChange={(e) => setReasonCode(e.target.value)}>
              {REASONS.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
            </select>
          </div>

          <div className="decision-actions">
            <Button variant="primary" onClick={() => decide("approve")} disabled={busy}><Icon name="check" size={16} /> Approve</Button>
            <Button variant="ghost" onClick={() => decide("conditional")} disabled={busy}>Conditional offer</Button>
            <Button variant="danger" onClick={() => decide("decline")} disabled={busy}>Decline</Button>
          </div>
          <Button variant="quiet" onClick={requestDoc} style={{ width: "100%" }}><Icon name="upload" size={15} /> Request documents</Button>

          <div className="notes-area">
            <h3 style={{ fontSize: 14, marginBottom: 10 }}>Internal notes</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input className="input" placeholder="Add a private note…" style={{ fontSize: 13 }} value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNote()} />
              <Button variant="ghost" size="sm" onClick={addNote}>Add</Button>
            </div>
            {notes.map((n) => (
              <div key={n.id} className="note-item">
                <div className="ni-head"><b>{n.authorName}</b><span>{formatDate(n.createdAt)}</span></div>
                {n.body}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function outcomeStamp(o: ScreeningResult["creditOutcome"]): { variant: string; label: string } {
  if (o === "pass") return { variant: "approved", label: "Pass" };
  if (o === "flag") return { variant: "review", label: "Flag" };
  if (o === "fail") return { variant: "declined", label: "Fail" };
  return { variant: "received", label: "Pending" };
}
function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
