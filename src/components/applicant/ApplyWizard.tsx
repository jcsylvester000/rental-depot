"use client";

import * as React from "react";
import Link from "next/link";
import type { Unit } from "@/lib/types";
import { formatMoney, money, incomeToRent } from "@/lib/money";
import { isEmail, nonEmpty, toNumber } from "@/lib/validators";
import { Button, LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Stamp } from "@/components/ui/Stamp";
import { useSession } from "@/lib/client/session";
import { useToast } from "@/lib/client/toast";
import { DocUploadButton } from "@/components/applicant/DocUploadButton";
import type { UploadedAsset } from "@/lib/client/upload";

const APPLICATION_FEE = money(100000); // ₱1,000

type DocDef = { key: string; label: string; required: boolean };

const RESIDENTIAL_DOCS: DocDef[] = [
  { key: "gov_id", label: "Government ID", required: true },
  { key: "payslip", label: "Payslip (latest)", required: true },
  { key: "payslip2", label: "Payslip (prior month)", required: false },
  { key: "income", label: "Proof of income / bank statement", required: true },
];

const COMMERCIAL_DOCS: DocDef[] = [
  { key: "business_reg", label: "Business registration (SEC/DTI)", required: true },
  { key: "financials", label: "Financial statements", required: true },
  { key: "bank", label: "Business bank statement", required: true },
  { key: "principal_id", label: "Principal's government ID", required: true },
];

interface DocState { uploaded: boolean; assetRef?: string; fileName?: string }

// Map wizard doc keys → data-contract DocumentType values.
const DOC_TYPE: Record<string, string> = {
  gov_id: "gov_id", payslip: "payslip", payslip2: "payslip", income: "income_proof",
  business_reg: "other", financials: "income_proof", bank: "bank_statement", principal_id: "gov_id",
};

interface Party {
  id: string;
  email: string;
  role: "co_applicant" | "occupant" | "guarantor";
}

interface Draft {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  currentAddress: string;
  city: string;
  yearsAtAddress: string;
  housingCost: string;
  reasonMoving: string;
  landlordContact: string;
  employer: string;
  position: string;
  employmentLength: string;
  grossIncome: string;
  additionalIncome: string;
  // Commercial
  businessName: string;
  businessType: string;
  natureOfBusiness: string;
  yearsOperating: string;
  intendedUse: string;
  employees: string;
  documents: Record<string, DocState>;
  occupants: string;
  pets: string;
  parties: Party[];
  consent: boolean;
  signature: string;
  feePaid: boolean;
}

const EMPTY_DRAFT: Draft = {
  firstName: "", lastName: "", email: "", phone: "", dob: "",
  currentAddress: "", city: "", yearsAtAddress: "1–2 years", housingCost: "", reasonMoving: "", landlordContact: "",
  employer: "", position: "", employmentLength: "1–3 years", grossIncome: "", additionalIncome: "",
  businessName: "", businessType: "Corporation", natureOfBusiness: "", yearsOperating: "", intendedUse: "", employees: "",
  documents: {},
  occupants: "1", pets: "", parties: [],
  consent: false, signature: "", feePaid: false,
};

const RESIDENTIAL_STEPS = [
  { n: 1, label: "Personal details", sub: "Who you are" },
  { n: 2, label: "Residence history", sub: "Where you've lived" },
  { n: 3, label: "Employment & income", sub: "Ability to pay" },
  { n: 4, label: "Documents", sub: "Proof & household" },
  { n: 5, label: "Review & sign", sub: "Consent & submit" },
];

const COMMERCIAL_STEPS = [
  { n: 1, label: "Business details", sub: "Your company" },
  { n: 2, label: "Premises & use", sub: "How you'll use it" },
  { n: 3, label: "Financials", sub: "Ability to pay" },
  { n: 4, label: "Documents", sub: "Registration & guarantor" },
  { n: 5, label: "Review & sign", sub: "Consent & submit" },
];

export function ApplyWizard({ unit, location }: { unit: Unit; location: string }) {
  const { user } = useSession();
  const { toast } = useToast();
  const storageKey = `rd.application.${unit.id}`;
  const isCommercial = unit.propertyClass === "commercial";
  const DOCS = isCommercial ? COMMERCIAL_DOCS : RESIDENTIAL_DOCS;
  const STEPS = isCommercial ? COMMERCIAL_STEPS : RESIDENTIAL_STEPS;
  const docUploaded = (key: string) => draft.documents[key]?.uploaded ?? false;

  const [step, setStep] = React.useState(1);
  const [draft, setDraft] = React.useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState<{ reference: string } | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const hydrated = React.useRef(false);

  // Resume from saved draft, else pre-fill from profile/session.
  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    let loaded: Partial<Draft> | null = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) loaded = JSON.parse(raw);
    } catch {
      /* ignore */
    }
    if (loaded) {
      setDraft({ ...EMPTY_DRAFT, ...loaded });
      toast("Welcome back — we picked up where you left off");
    } else {
      let profile: Record<string, string> = {};
      try {
        profile = JSON.parse(localStorage.getItem("rd.profile") ?? "{}");
      } catch {
        /* ignore */
      }
      const [first, ...rest] = (user?.fullName ?? "").split(" ");
      setDraft((d) => ({
        ...d,
        firstName: first ?? "",
        lastName: rest.join(" "),
        email: user?.email ?? "",
        phone: profile.phone ?? "",
        currentAddress: profile.currentAddress ?? "",
        employer: profile.employer ?? "",
        position: profile.position ?? "",
        grossIncome: profile.grossIncome ?? "",
      }));
    }
    hydrated.current = true;
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [storageKey, user, toast]);

  // Auto-save on change (after hydration).
  React.useEffect(() => {
    if (!hydrated.current || submitted) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
  }, [draft, storageKey, submitted]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setErrors((e) => (e[k as string] ? { ...e, [k as string]: "" } : e));
  };

  function validateStep(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (isCommercial) {
        if (!nonEmpty(draft.businessName)) e.businessName = "Business name is required";
        if (!nonEmpty(draft.natureOfBusiness)) e.natureOfBusiness = "Required";
      }
      if (!nonEmpty(draft.firstName)) e.firstName = "This field is required";
      if (!nonEmpty(draft.lastName)) e.lastName = "This field is required";
      if (!isEmail(draft.email)) e.email = "Enter a valid email address";
      if (!nonEmpty(draft.phone)) e.phone = "This field is required";
      if (!isCommercial && !nonEmpty(draft.dob)) e.dob = "This field is required";
    } else if (s === 2) {
      if (isCommercial) {
        if (!nonEmpty(draft.intendedUse)) e.intendedUse = "Please describe the intended use";
      } else {
        if (!nonEmpty(draft.currentAddress)) e.currentAddress = "This field is required";
        if (!nonEmpty(draft.city)) e.city = "Required";
      }
    } else if (s === 3) {
      if (isCommercial) {
        if (!nonEmpty(draft.grossIncome)) e.grossIncome = "Required";
      } else {
        if (!nonEmpty(draft.employer)) e.employer = "Required";
        if (!nonEmpty(draft.grossIncome)) e.grossIncome = "Required";
      }
    } else if (s === 4) {
      const missing = DOCS.filter((d) => d.required && !docUploaded(d.key));
      if (missing.length) e.documents = `Please upload: ${missing.map((m) => m.label).join(", ")}`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goTo(next: number) {
    if (next > step && !validateStep(step)) return;
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onDocUploaded(key: string, asset: UploadedAsset) {
    set("documents", { ...draft.documents, [key]: { uploaded: true, assetRef: asset.url, fileName: asset.fileName } });
  }
  const nextPendingKey = (): string | undefined => DOCS.find((d) => !docUploaded(d.key))?.key;

  function inviteParty(email: string, role: Party["role"]) {
    if (!isEmail(email)) return toast("Enter a valid email to invite");
    set("parties", [...draft.parties, { id: `${Date.now()}`, email, role }]);
    toast("Invite sent — they complete their part privately");
  }

  async function submit() {
    if (!draft.consent) return setErrors({ consent: "Consent is required to submit" });
    if (!nonEmpty(draft.signature)) return setErrors({ signature: "Please type your name to sign" });
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: unit.id,
          applicant: {
            fullName: `${draft.firstName} ${draft.lastName}`.trim(),
            email: draft.email,
            phone: draft.phone,
            dateOfBirth: draft.dob ? new Date(draft.dob).toISOString() : undefined,
          },
          applicantType: isCommercial ? "business" : "individual",
          businessName: isCommercial ? draft.businessName : undefined,
          businessType: isCommercial ? draft.businessType : undefined,
          natureOfBusiness: isCommercial ? draft.natureOfBusiness : undefined,
          yearsOperating: isCommercial && draft.yearsOperating ? Number(draft.yearsOperating) : undefined,
          intendedUse: isCommercial ? draft.intendedUse : undefined,
          currentAddress: draft.currentAddress,
          employer: isCommercial ? draft.businessName : draft.employer,
          position: draft.position,
          monthlyIncomeMinor: toNumber(draft.grossIncome) * 100,
          leaseTermMonths: isCommercial ? 36 : 12,
          occupants: Number(draft.occupants),
          pets: draft.pets,
          documentsUploaded: DOCS.filter((d) => docUploaded(d.key)).map((d) => ({ type: DOC_TYPE[d.key], label: d.label, assetRef: draft.documents[d.key].assetRef, fileName: draft.documents[d.key].fileName })),
          consent: draft.consent,
          signatureName: draft.signature,
          feePaid: draft.feePaid,
        }),
      });
      const body = await res.json();
      if (body.ok) {
        try {
          localStorage.removeItem(storageKey);
        } catch {
          /* ignore */
        }
        setSubmitted({ reference: body.data.reference });
        window.scrollTo({ top: 0 });
      } else {
        toast(body.error?.message ?? "Submission failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="card submitted-card">
        <div className="big-check"><Icon name="check" size={30} /></div>
        <h1 style={{ fontSize: 30 }}>Application submitted</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          Your reference is <b className="mono" style={{ color: "var(--ink)" }}>{submitted.reference}</b>. We've sent a
          confirmation to {draft.email}. You can track progress any time.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24 }}>
          <LinkButton href="/status" variant="primary"><Icon name="inbox" size={16} /> Track application</LinkButton>
          <LinkButton href="/listings" variant="ghost">Browse more homes</LinkButton>
        </div>
      </div>
    );
  }

  const incomeRatio =
    toNumber(draft.grossIncome) > 0
      ? incomeToRent(toNumber(draft.grossIncome) * 100, unit.rent.amountMinor)
      : 0;

  return (
    <div className="app-shell">
      {/* sidebar */}
      <aside className="app-side">
        <div className="unit-mini">
          <div className="eyebrow" style={{ marginBottom: 6 }}>Applying for</div>
          <div className="rent">{formatMoney(unit.rent)} <span className="muted" style={{ fontSize: 12 }}>/mo</span></div>
          <div className="addr">{location}</div>
          <div className="mono muted" style={{ fontSize: 11, marginTop: 8 }}>{unit.code} · {isCommercial ? (unit.permittedUse ?? "Commercial") : unit.bedrooms === 0 ? "Studio" : `${unit.bedrooms} bed`} · {unit.areaSqm} m²</div>
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Your progress</div>
          <ul className="progress-steps">
            {STEPS.map((s) => (
              <li key={s.n} className={step === s.n ? "active" : step > s.n ? "done" : ""}>
                <span className="node">{step > s.n ? "✓" : s.n}</span>
                <span className="st-label">{s.label}<small>{s.sub}</small></span>
              </li>
            ))}
          </ul>
        </div>
        <div className="muted mono" style={{ fontSize: 11.5 }}>Progress auto-saves</div>
      </aside>

      {/* main */}
      <main className="app-main" id="main">
        <div className="app-progress-mobile">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span className="eyebrow">Step {step} of 5</span>
            <span className="muted" style={{ fontSize: 12 }}>{STEPS[step - 1].label}</span>
          </div>
          <div style={{ height: 5, background: "var(--paper-3)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(step / 5) * 100}%`, background: "var(--verdigris)", transition: "width .3s" }} />
          </div>
        </div>

        {step === 1 && (
          <section className="step-panel">
            <span className="eyebrow">Step 01 · {STEPS[0].label}</span>
            <h1 className="step-title">{isCommercial ? "Tell us about your business" : "Let's start with you"}</h1>
            <p className="step-sub">{isCommercial ? "Your company and who we should contact." : "Just the basics. You can save and come back at any point."}</p>
            <div className="card app-form-card">
              {isCommercial && (
                <>
                  <Field label="Registered business name" error={errors.businessName}><input className={`input ${errors.businessName ? "err" : ""}`} value={draft.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="Brew & Co." /></Field>
                  <div className="field-row">
                    <Field label="Entity type"><select className="select" value={draft.businessType} onChange={(e) => set("businessType", e.target.value)}><option>Sole Proprietorship</option><option>Partnership</option><option>Corporation</option><option>Cooperative</option></select></Field>
                    <Field label="Years operating"><input className="input" type="number" inputMode="numeric" value={draft.yearsOperating} onChange={(e) => set("yearsOperating", e.target.value)} placeholder="3" /></Field>
                  </div>
                  <Field label="Nature of business" error={errors.natureOfBusiness}><input className={`input ${errors.natureOfBusiness ? "err" : ""}`} value={draft.natureOfBusiness} onChange={(e) => set("natureOfBusiness", e.target.value)} placeholder="Coffee shop / F&B" /></Field>
                  <div style={{ borderTop: "1px solid var(--line)", margin: "6px 0 16px" }} />
                  <p className="muted" style={{ fontSize: 13, margin: "0 0 12px" }}>Primary contact</p>
                </>
              )}
              <div className="field-row">
                <Field label={isCommercial ? "Contact first name" : "Legal first name"} error={errors.firstName}><input className={`input ${errors.firstName ? "err" : ""}`} value={draft.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Maria" /></Field>
                <Field label={isCommercial ? "Contact last name" : "Legal last name"} error={errors.lastName}><input className={`input ${errors.lastName ? "err" : ""}`} value={draft.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Santos" /></Field>
              </div>
              <Field label="Email address" why="To send your application updates" error={errors.email}><input className={`input ${errors.email ? "err" : ""}`} type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} placeholder="maria@email.com" /></Field>
              <div className="field-row">
                <Field label="Mobile number" error={errors.phone}><input className={`input ${errors.phone ? "err" : ""}`} value={draft.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+63 917 000 0000" /></Field>
                {!isCommercial && <Field label="Date of birth" error={errors.dob}><input className={`input ${errors.dob ? "err" : ""}`} type="date" value={draft.dob} onChange={(e) => set("dob", e.target.value)} /></Field>}
              </div>
            </div>
            <Nav onNext={() => goTo(2)} nextLabel={isCommercial ? "Continue to premises" : "Continue to residence"} />
          </section>
        )}

        {step === 2 && !isCommercial && (
          <section className="step-panel">
            <span className="eyebrow">Step 02 · Residence history</span>
            <h1 className="step-title">Where you've lived</h1>
            <p className="step-sub">Your current address and a little about your tenancy.</p>
            <div className="card app-form-card">
              <Field label="Current street address" error={errors.currentAddress}><input className={`input ${errors.currentAddress ? "err" : ""}`} value={draft.currentAddress} onChange={(e) => set("currentAddress", e.target.value)} placeholder="123 Maginhawa St" /></Field>
              <div className="field-row">
                <Field label="City" error={errors.city}><input className={`input ${errors.city ? "err" : ""}`} value={draft.city} onChange={(e) => set("city", e.target.value)} placeholder="Quezon City" /></Field>
                <Field label="Years at this address"><select className="select" value={draft.yearsAtAddress} onChange={(e) => set("yearsAtAddress", e.target.value)}><option>Less than 1 year</option><option>1–2 years</option><option>3–5 years</option><option>5+ years</option></select></Field>
              </div>
              <div className="field-row">
                <Field label="Monthly rent / mortgage"><input className="input" value={draft.housingCost} onChange={(e) => set("housingCost", e.target.value)} placeholder="₱22,000" /></Field>
                <Field label="Reason for moving"><input className="input" value={draft.reasonMoving} onChange={(e) => set("reasonMoving", e.target.value)} placeholder="Closer to work" /></Field>
              </div>
              <Field label="Current landlord contact" optional><input className="input" value={draft.landlordContact} onChange={(e) => set("landlordContact", e.target.value)} placeholder="Name and number" /></Field>
            </div>
            <Nav onBack={() => goTo(1)} onNext={() => goTo(3)} nextLabel="Continue to income" />
          </section>
        )}

        {step === 2 && isCommercial && (
          <section className="step-panel">
            <span className="eyebrow">Step 02 · Premises & use</span>
            <h1 className="step-title">How you'll use the space</h1>
            <p className="step-sub">Tell us what you'll operate here — it helps confirm the unit's permitted use{unit.permittedUse ? ` (${unit.permittedUse})` : ""}.</p>
            <div className="card app-form-card">
              <Field label="Intended use" error={errors.intendedUse}><textarea className={`input ${errors.intendedUse ? "err" : ""}`} rows={3} value={draft.intendedUse} onChange={(e) => set("intendedUse", e.target.value)} placeholder="e.g. Specialty coffee shop with a small kitchen and 20 seats" /></Field>
              <div className="field-row">
                <Field label="Approx. number of staff on site"><input className="input" type="number" inputMode="numeric" value={draft.employees} onChange={(e) => set("employees", e.target.value)} placeholder="8" /></Field>
                <Field label="Preferred lease term"><select className="select" value={draft.employmentLength} onChange={(e) => set("employmentLength", e.target.value)}><option>1 year</option><option>3 years</option><option>5 years</option></select></Field>
              </div>
            </div>
            <Nav onBack={() => goTo(1)} onNext={() => goTo(3)} nextLabel="Continue to financials" />
          </section>
        )}

        {step === 3 && !isCommercial && (
          <section className="step-panel">
            <span className="eyebrow">Step 03 · Employment & income</span>
            <h1 className="step-title">Your ability to pay</h1>
            <p className="step-sub">Most homes look for gross income around {unit.incomeMultiple}× the rent.</p>
            <div className="card app-form-card">
              <Field label="Employer / income source" error={errors.employer}><input className={`input ${errors.employer ? "err" : ""}`} value={draft.employer} onChange={(e) => set("employer", e.target.value)} placeholder="Company name or self-employed" /></Field>
              <div className="field-row">
                <Field label="Position / role"><input className="input" value={draft.position} onChange={(e) => set("position", e.target.value)} placeholder="Product Designer" /></Field>
                <Field label="Length of employment"><select className="select" value={draft.employmentLength} onChange={(e) => set("employmentLength", e.target.value)}><option>Less than 1 year</option><option>1–3 years</option><option>3+ years</option></select></Field>
              </div>
              <Field label="Gross monthly income (₱)" why="To check affordability, kept private" error={errors.grossIncome}>
                <input className={`input ${errors.grossIncome ? "err" : ""}`} type="text" inputMode="numeric" value={draft.grossIncome} onChange={(e) => set("grossIncome", e.target.value)} placeholder="95000" />
                <div className="hint">
                  For this unit ({formatMoney(unit.rent)}), around {formatMoney(money(unit.rent.amountMinor * unit.incomeMultiple))}+ meets the {unit.incomeMultiple}× guideline.
                  {incomeRatio > 0 && ` Your ratio: ${incomeRatio}×.`}
                </div>
              </Field>
              <Field label="Additional income" optional><input className="input" value={draft.additionalIncome} onChange={(e) => set("additionalIncome", e.target.value)} placeholder="Freelance, investments, etc." /></Field>
            </div>
            <Nav onBack={() => goTo(2)} onNext={() => goTo(4)} nextLabel="Continue to documents" />
          </section>
        )}

        {step === 3 && isCommercial && (
          <section className="step-panel">
            <span className="eyebrow">Step 03 · Financials</span>
            <h1 className="step-title">Business ability to pay</h1>
            <p className="step-sub">Operators typically look for monthly revenue comfortably above the rent.</p>
            <div className="card app-form-card">
              <Field label="Average monthly revenue (₱)" why="Used to assess affordability, kept private" error={errors.grossIncome}>
                <input className={`input ${errors.grossIncome ? "err" : ""}`} type="text" inputMode="numeric" value={draft.grossIncome} onChange={(e) => set("grossIncome", e.target.value)} placeholder="450000" />
                <div className="hint">
                  Rent here is {formatMoney(unit.rent)}/mo{incomeRatio > 0 && ` — your revenue-to-rent ratio: ${incomeRatio}×`}.
                </div>
              </Field>
              <Field label="Other locations / notes" optional><input className="input" value={draft.additionalIncome} onChange={(e) => set("additionalIncome", e.target.value)} placeholder="e.g. 2 existing branches" /></Field>
            </div>
            <Nav onBack={() => goTo(2)} onNext={() => goTo(4)} nextLabel="Continue to documents" />
          </section>
        )}

        {step === 4 && (
          <section className="step-panel">
            <span className="eyebrow">Step 04 · {isCommercial ? "Documents & guarantor" : "Documents & household"}</span>
            <h1 className="step-title">{isCommercial ? "Registration & guarantor" : "Proof & who's moving in"}</h1>
            <p className="step-sub">{DOCS.filter((d) => docUploaded(d.key)).length} of {DOCS.length} documents uploaded</p>
            <div className="card app-form-card">
              <div className="upload-zone">
                <div className="ic"><Icon name="upload" size={26} /></div>
                <div style={{ fontWeight: 600 }}>Upload a document or take a photo</div>
                <div className="muted" style={{ fontSize: 13, margin: "4px 0 12px" }}>PDF, JPG, PNG or HEIC · up to 10 MB each</div>
                {nextPendingKey() ? (
                  <DocUploadButton label={`Upload ${DOCS.find((d) => d.key === nextPendingKey())?.label}`} variant="accent" folder="rental-depot/applications" onUploaded={(a) => onDocUploaded(nextPendingKey()!, a)} />
                ) : (
                  <span className="pill accent"><Icon name="check" size={13} /> All documents uploaded</span>
                )}
              </div>

              <ul className="doc-list">
                {DOCS.map((d) => {
                  const done = docUploaded(d.key);
                  return (
                    <li key={d.key} className={`doc-item ${done ? "done" : ""}`}>
                      <span className="di-ic"><Icon name={done ? "check" : "file"} size={16} /></span>
                      <div>
                        <div className="di-name">{d.label}{!d.required && <span className="muted" style={{ fontWeight: 400 }}> (optional)</span>}</div>
                        <div className="di-meta">{done ? draft.documents[d.key]?.fileName ?? "Uploaded" : "Not uploaded yet"}</div>
                      </div>
                      <span className="di-status">
                        {done ? <Stamp variant="approved">Uploaded</Stamp> : (
                          <DocUploadButton folder="rental-depot/applications" onUploaded={(a) => onDocUploaded(d.key, a)} />
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {errors.documents && <div className="err-msg" role="alert" style={{ marginTop: 10 }}><Icon name="flag" size={14} /> {errors.documents}</div>}

              <div style={{ borderTop: "1px solid var(--line)", margin: "22px 0 18px" }} />

              {!isCommercial && (
                <Field label="Occupants (including you)">
                  <select className="select" value={draft.occupants} onChange={(e) => set("occupants", e.target.value)}><option>1</option><option>2</option><option>3</option><option>4+</option></select>
                </Field>
              )}

              <PartyInvite commercial={isCommercial} parties={draft.parties} onInvite={inviteParty} onRemove={(id) => set("parties", draft.parties.filter((p) => p.id !== id))} />

              {!isCommercial && (
                <Field label={`Pets ${unit.petsAllowed ? "(this unit is pet-friendly)" : "(this unit is not pet-friendly)"}`} optional>
                  <input className="input" value={draft.pets} onChange={(e) => set("pets", e.target.value)} placeholder="e.g. 1 cat, spayed" disabled={!unit.petsAllowed} />
                </Field>
              )}
            </div>
            <Nav onBack={() => goTo(3)} onNext={() => goTo(5)} nextLabel="Continue to review" />
          </section>
        )}

        {step === 5 && (
          <section className="step-panel">
            <span className="eyebrow">Step 05 · Review & sign</span>
            <h1 className="step-title">Check, consent, and sign</h1>
            <p className="step-sub">Read everything back before it goes. Edit any section in one tap.</p>

            {isCommercial ? (
              <>
                <ReviewBlock title="Business details" onEdit={() => goTo(1)} rows={[
                  ["Business", draft.businessName || "—"],
                  ["Entity type", draft.businessType || "—"],
                  ["Nature of business", draft.natureOfBusiness || "—"],
                  ["Years operating", draft.yearsOperating || "—"],
                  ["Contact", `${draft.firstName} ${draft.lastName}`.trim() || "—"],
                  ["Email", draft.email || "—"],
                ]} />
                <ReviewBlock title="Premises & financials" onEdit={() => goTo(2)} rows={[
                  ["Intended use", draft.intendedUse || "—"],
                  ["Staff on site", draft.employees || "—"],
                  ["Monthly revenue", draft.grossIncome ? formatMoney(money(toNumber(draft.grossIncome) * 100)) : "—"],
                  ["Revenue-to-rent", incomeRatio > 0 ? `${incomeRatio}×` : "—"],
                ]} />
                <ReviewBlock title="Documents & guarantor" onEdit={() => goTo(4)} rows={[
                  ["Documents", `${DOCS.filter((d) => docUploaded(d.key)).length} uploaded`],
                  ["Guarantor / co-signer", draft.parties.length ? `${draft.parties.length} invited` : "None"],
                ]} />
              </>
            ) : (
              <>
                <ReviewBlock title="Personal details" onEdit={() => goTo(1)} rows={[
                  ["Name", `${draft.firstName} ${draft.lastName}`.trim() || "—"],
                  ["Email", draft.email || "—"],
                  ["Mobile", draft.phone || "—"],
                  ["Date of birth", draft.dob || "—"],
                ]} />
                <ReviewBlock title="Employment & income" onEdit={() => goTo(3)} rows={[
                  ["Employer", draft.employer || "—"],
                  ["Gross monthly income", draft.grossIncome ? formatMoney(money(toNumber(draft.grossIncome) * 100)) : "—"],
                  ["Income-to-rent", incomeRatio > 0 ? `${incomeRatio}×` : "—"],
                  ["Employment", draft.employmentLength],
                ]} />
                <ReviewBlock title="Documents & household" onEdit={() => goTo(4)} rows={[
                  ["Documents", `${DOCS.filter((d) => docUploaded(d.key)).length} uploaded`],
                  ["Occupants", draft.occupants],
                  ["Co-applicants / guarantors", draft.parties.length ? `${draft.parties.length} invited` : "None"],
                  ["Pets", draft.pets || "None"],
                ]} />
              </>
            )}

            <div className="consent-box">
              <label>
                <input type="checkbox" checked={draft.consent} onChange={(e) => set("consent", e.target.checked)} />
                <span>I consent to Rental Depot and the property manager running credit, background, and eviction checks for this application. I confirm the information provided is accurate. <b>Consent is recorded with a timestamp.</b></span>
              </label>
            </div>
            {errors.consent && <div className="err-msg" role="alert" style={{ marginTop: -8, marginBottom: 12 }}><Icon name="flag" size={14} /> {errors.consent}</div>}

            {/* Fee */}
            <div className={`fee-box ${draft.feePaid ? "paid" : ""}`}>
              <div>
                <div style={{ fontWeight: 600 }}>Application fee</div>
                <div className="muted" style={{ fontSize: 13 }}>Covers screening. Where the law caps or waives fees, this is adjusted.</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="fee-amount">{formatMoney(APPLICATION_FEE)}</div>
                {draft.feePaid ? (
                  <span className="pill accent"><Icon name="check" size={13} /> Paid · receipt sent</span>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => { set("feePaid", true); toast("Payment received — receipt sent"); }}>Pay now</Button>
                )}
              </div>
            </div>

            <div className="field" style={{ marginBottom: 6 }}>
              <label>Type your full name to sign</label>
              <input className={`input ${errors.signature ? "err" : ""}`} value={draft.signature} onChange={(e) => set("signature", e.target.value)} placeholder={`${draft.firstName} ${draft.lastName}`.trim() || "Your full name"} />
            </div>
            <div className="sign-pad">
              <div className={`sig ${draft.signature ? "" : "empty"}`}>{draft.signature || "Your signature"}</div>
              <div className="muted mono" style={{ fontSize: 11, marginTop: 6 }}>Electronic signature · {new Date().toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric" })}</div>
            </div>
            {errors.signature && <div className="err-msg" role="alert" style={{ marginTop: 8 }}><Icon name="flag" size={14} /> {errors.signature}</div>}

            <div className="app-nav">
              <Button variant="ghost" onClick={() => goTo(4)}><Icon name="arrowLeft" size={15} /> Back</Button>
              <Button variant="accent" size="lg" onClick={submit} disabled={submitting}>
                <Icon name="check" size={16} /> {submitting ? "Submitting…" : "Submit application"}
              </Button>
            </div>
          </section>
        )}

        <div style={{ marginTop: 20 }}>
          <Link href={`/listings/${unit.id}`} className="muted" style={{ fontSize: 13 }}>Save & exit — your progress is kept</Link>
        </div>
      </main>
    </div>
  );
}

/* ---- small local components ---- */

function Field({ label, children, why, optional, error }: { label: string; children: React.ReactNode; why?: string; optional?: boolean; error?: string }) {
  return (
    <div className="field">
      <label>
        {label}{" "}
        {why && <span className="why">Why? {why}</span>}
        {optional && <span className="muted" style={{ fontWeight: 400 }}>(optional)</span>}
      </label>
      {children}
      {error && <div className="err-msg" role="alert"><Icon name="flag" size={13} /> {error}</div>}
    </div>
  );
}

function Nav({ onBack, onNext, nextLabel }: { onBack?: () => void; onNext: () => void; nextLabel: string }) {
  return (
    <div className="app-nav">
      {onBack ? <Button variant="ghost" onClick={onBack}><Icon name="arrowLeft" size={15} /> Back</Button> : <span />}
      <Button variant="primary" onClick={onNext}>{nextLabel} <Icon name="arrowRight" size={15} /></Button>
    </div>
  );
}

function ReviewBlock({ title, onEdit, rows }: { title: string; onEdit: () => void; rows: [string, string][] }) {
  return (
    <div className="review-block">
      <div className="rb-head"><h4>{title}</h4><button onClick={onEdit}>Edit</button></div>
      <div className="rb-body">
        {rows.map(([k, v]) => (
          <div key={k} className="r"><span>{k}</span>{v}</div>
        ))}
      </div>
    </div>
  );
}

function PartyInvite({ commercial, parties, onInvite, onRemove }: { commercial?: boolean; parties: Party[]; onInvite: (email: string, role: Party["role"]) => void; onRemove: (id: string) => void }) {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<Party["role"]>(commercial ? "guarantor" : "co_applicant");
  const roleLabel: Record<Party["role"], string> = { co_applicant: "Co-applicant", occupant: "Occupant", guarantor: "Guarantor" };
  return (
    <div className="field">
      <label>{commercial ? "Guarantor / co-signer" : "Co-applicant or guarantor"} <span className="muted" style={{ fontWeight: 400 }}>(optional{commercial ? ", recommended for newer businesses" : ""})</span></label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input className="input" style={{ flex: "1 1 200px" }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="their@email.com" />
        <select className="select" style={{ width: "auto" }} value={role} onChange={(e) => setRole(e.target.value as Party["role"])}>
          <option value="co_applicant">Co-applicant</option>
          <option value="occupant">Occupant</option>
          <option value="guarantor">Guarantor</option>
        </select>
        <Button variant="ghost" onClick={() => { onInvite(email, role); setEmail(""); }}><Icon name="users" size={15} /> Invite</Button>
      </div>
      <div className="hint">Each person completes their own section — they won't see each other's financial details.</div>
      {parties.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {parties.map((p) => (
            <div key={p.id} className="party-item">
              <Icon name="users" size={15} /> {p.email}
              <span className="p-role"><Stamp variant="review">{roleLabel[p.role]}</Stamp></span>
              <button onClick={() => onRemove(p.id)} className="btn btn-quiet btn-sm" aria-label="Remove">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
