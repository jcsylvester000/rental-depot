/* ============================================================
 * RENTAL DEPOT — Mock DataStore implementation
 * Implements the DataStore contract against in-memory seed data.
 * Swapped for a Prisma-backed store in Phase 6 (same interface).
 *
 * Note: per the normalized contract, city/region live on Property,
 * not Unit. We enrich reads from Property at read time.
 * ============================================================ */

import type {
  DataStore,
  UnitListFilter,
  ApplicationListFilter,
  CreateApplicationInput,
  AdminQueueFilter,
  DecisionInput,
} from "@/lib/data/store";
import type {
  Unit,
  UnitSummary,
  Application,
  ApplicationDetail,
  ApplicationTracking,
  AdminQueueRow,
  AnalyticsSummary,
  ApplicationDocument,
  DocumentType,
  Message,
  DocumentRequest,
  Lease,
  Decision,
  OperatorNote,
  ScreeningResult,
} from "@/lib/types";
import {
  units,
  properties,
  applications,
  applicants,
  parties,
  documents,
  references,
  screeningResults,
  decisions,
  messages,
  documentRequests,
  leases,
  payments,
  operatorNotes,
} from "@/lib/mock/seed";

const REQUIRED_DOC_TYPES: DocumentType[] = ["gov_id", "payslip", "income_proof"];

function completenessOf(appId: string, feePaid: boolean, consent: boolean): number {
  const uploaded = new Set(documents.filter((d) => d.applicationId === appId).map((d) => d.type));
  const docPct = (REQUIRED_DOC_TYPES.filter((t) => uploaded.has(t)).length / REQUIRED_DOC_TYPES.length) * 60;
  return Math.round(docPct + (consent ? 20 : 0) + (feePaid ? 20 : 0));
}

function locationOf(u: Unit): { city: string; region: string } {
  const p = properties.find((x) => x.id === u.propertyId);
  return { city: p?.city ?? "", region: p?.region ?? "" };
}

function toSummary(u: Unit): UnitSummary {
  const { city, region } = locationOf(u);
  return {
    id: u.id,
    code: u.code,
    title: u.title,
    city,
    region,
    bedrooms: u.bedrooms,
    bathrooms: u.bathrooms,
    areaSqm: u.areaSqm,
    rent: u.rent,
    status: u.status,
    petsAllowed: u.petsAllowed,
    amenities: u.amenities,
    coverPhoto: u.photos[0],
    availableFrom: u.availableFrom,
  };
}

export const mockStore: DataStore = {
  async listUnits(filter?: UnitListFilter): Promise<UnitSummary[]> {
    let list = [...units];

    if (filter) {
      if (filter.city) {
        const c = filter.city.toLowerCase();
        list = list.filter((u) => locationOf(u).city.toLowerCase().includes(c));
      }
      if (filter.bedrooms != null) list = list.filter((u) => u.bedrooms >= filter.bedrooms!);
      if (filter.petsAllowed != null) list = list.filter((u) => u.petsAllowed === filter.petsAllowed);
      if (filter.status) list = list.filter((u) => u.status === filter.status);
      if (filter.minRentMinor != null) list = list.filter((u) => u.rent.amountMinor >= filter.minRentMinor!);
      if (filter.maxRentMinor != null) list = list.filter((u) => u.rent.amountMinor <= filter.maxRentMinor!);
      if (filter.amenities?.length) list = list.filter((u) => filter.amenities!.every((a) => u.amenities.includes(a)));

      if (filter.sort === "rent_asc") list.sort((a, b) => a.rent.amountMinor - b.rent.amountMinor);
      else if (filter.sort === "rent_desc") list.sort((a, b) => b.rent.amountMinor - a.rent.amountMinor);
      else list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }

    return list.map(toSummary);
  },

  async getUnit(id: string): Promise<Unit | null> {
    return units.find((u) => u.id === id) ?? null;
  },

  async getProperty(id: string) {
    return properties.find((p) => p.id === id) ?? null;
  },

  async listProperties() {
    return [...properties];
  },

  async listApplications(filter?: ApplicationListFilter): Promise<Application[]> {
    let list = [...applications];
    if (filter?.status) list = list.filter((a) => a.status === filter.status);
    if (filter?.unitId) list = list.filter((a) => a.unitId === filter.unitId);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((a) => {
        const applicant = applicants.find((p) => p.id === a.primaryApplicantId);
        return (
          a.reference.toLowerCase().includes(q) ||
          (applicant?.fullName.toLowerCase().includes(q) ?? false) ||
          (applicant?.email.toLowerCase().includes(q) ?? false)
        );
      });
    }
    if (filter?.sort === "oldest") list.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
    else list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return list;
  },

  async getApplicationByRef(reference: string): Promise<ApplicationDetail | null> {
    const app = applications.find((a) => a.reference === reference);
    return app ? this.getApplication(app.id) : null;
  },

  async createApplication(input: CreateApplicationInput): Promise<Application> {
    const now = new Date().toISOString();

    // Next reference number from existing APP-#### values.
    const maxRef = applications.reduce((m, a) => {
      const n = Number(a.reference.replace(/\D/g, ""));
      return Number.isFinite(n) ? Math.max(m, n) : m;
    }, 2041);
    const nextRef = maxRef + 1;
    const id = `app_${nextRef}`;

    const applicantId = `appl_${nextRef}`;
    applicants.push({
      id: applicantId,
      fullName: input.applicant.fullName,
      email: input.applicant.email,
      phone: input.applicant.phone,
      dateOfBirth: input.applicant.dateOfBirth,
      currentAddress: input.currentAddress,
      employer: input.employer,
      position: input.position,
      grossMonthlyIncome: input.monthlyIncomeMinor
        ? { amountMinor: input.monthlyIncomeMinor, currency: "PHP" }
        : undefined,
      createdAt: now,
    });

    const application: Application = {
      id,
      reference: `APP-${nextRef}`,
      unitId: input.unitId,
      primaryApplicantId: applicantId,
      status: "new",
      desiredMoveIn: input.desiredMoveIn,
      leaseTermMonths: input.leaseTermMonths,
      monthlyIncome: input.monthlyIncomeMinor
        ? { amountMinor: input.monthlyIncomeMinor, currency: "PHP" }
        : undefined,
      consentGivenAt: input.consent ? now : undefined,
      signatureName: input.signatureName,
      feeStatus: input.feePaid ? "paid" : "pending",
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    applications.push(application);

    parties.push({
      id: `party_${nextRef}`,
      applicationId: id,
      applicantId,
      role: "primary",
      completed: true,
    });

    (input.documentsUploaded ?? []).forEach((t, i) => {
      const doc: ApplicationDocument = {
        id: `doc_${nextRef}_${i}`,
        applicationId: id,
        type: t as DocumentType,
        label: t,
        status: "uploaded",
        uploadedAt: now,
      };
      documents.push(doc);
    });

    return application;
  },

  async getApplication(id: string): Promise<ApplicationDetail | null> {
    const app = applications.find((a) => a.id === id);
    if (!app) return null;
    const applicant = applicants.find((p) => p.id === app.primaryApplicantId)!;
    const unit = units.find((u) => u.id === app.unitId)!;
    return {
      ...app,
      applicant,
      unit,
      parties: parties.filter((p) => p.applicationId === app.id),
      documents: documents.filter((d) => d.applicationId === app.id),
      references: references.filter((r) => r.applicationId === app.id),
      screening: screeningResults.find((s) => s.applicationId === app.id),
      decision: decisions.find((d) => d.applicationId === app.id),
      messages: messages
        .filter((m) => m.applicationId === app.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1)),
      documentRequests: documentRequests.filter((r) => r.applicationId === app.id),
      lease: leases.find((l) => l.applicationId === app.id),
      payments: payments.filter((p) => p.applicationId === app.id || (leases.find((l) => l.applicationId === app.id)?.id === p.leaseId)),
      notes: operatorNotes
        .filter((n) => n.applicationId === app.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    };
  },

  async listAdminQueue(filter?: AdminQueueFilter): Promise<AdminQueueRow[]> {
    let rows: AdminQueueRow[] = applications.map((a) => {
      const applicant = applicants.find((p) => p.id === a.primaryApplicantId);
      const unit = units.find((u) => u.id === a.unitId);
      const screening = screeningResults.find((s) => s.applicationId === a.id);
      const openReq = documentRequests.some((r) => r.applicationId === a.id && r.status === "open");
      const completeness = completenessOf(a.id, a.feeStatus === "paid", !!a.consentGivenAt);
      const flags: string[] = [];
      if (screening?.evictionOutcome === "fail" || screening?.evictionOutcome === "flag") flags.push("eviction");
      if (screening?.backgroundOutcome === "fail" || screening?.backgroundOutcome === "flag") flags.push("background");
      if (unit && screening?.incomeToRent != null && screening.incomeToRent < unit.incomeMultiple) flags.push("income_low");
      if (openReq || a.status === "incomplete") flags.push("incomplete");
      return {
        id: a.id,
        reference: a.reference,
        applicantName: applicant?.fullName ?? "—",
        applicantEmail: applicant?.email ?? "",
        unitId: a.unitId,
        unitCode: unit?.code ?? "",
        unitTitle: unit?.title ?? "",
        status: a.status,
        submittedAt: a.submittedAt,
        completenessPct: completeness,
        score: a.rubric?.overall,
        incomeToRent: screening?.incomeToRent,
        creditScore: screening?.creditScore,
        flags,
      };
    });

    if (filter?.status) rows = rows.filter((r) => r.status === filter.status);
    if (filter?.unitId) rows = rows.filter((r) => r.unitId === filter.unitId);
    if (filter?.onlyIncomplete) rows = rows.filter((r) => r.flags.includes("incomplete"));
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      rows = rows.filter((r) =>
        r.reference.toLowerCase().includes(q) ||
        r.applicantName.toLowerCase().includes(q) ||
        r.applicantEmail.toLowerCase().includes(q) ||
        r.unitCode.toLowerCase().includes(q),
      );
    }
    if (filter?.sort === "oldest") rows.sort((a, b) => (a.submittedAt ?? "") < (b.submittedAt ?? "") ? -1 : 1);
    else if (filter?.sort === "score") rows.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    else if (filter?.sort === "completeness") rows.sort((a, b) => b.completenessPct - a.completenessPct);
    else rows.sort((a, b) => ((a.submittedAt ?? "") < (b.submittedAt ?? "") ? 1 : -1));

    return rows;
  },

  async getAnalytics(propertyId?: string): Promise<AnalyticsSummary> {
    const scopedUnitIds = propertyId ? new Set(units.filter((u) => u.propertyId === propertyId).map((u) => u.id)) : null;
    const scopedUnits = scopedUnitIds ? units.filter((u) => scopedUnitIds.has(u.id)) : units;
    const apps = scopedUnitIds ? applications.filter((a) => scopedUnitIds.has(a.unitId)) : applications;
    const scopedLeases = scopedUnitIds ? leases.filter((l) => scopedUnitIds.has(l.unitId)) : leases;

    const applicationsCount = apps.length;
    const approvals = apps.filter((a) => a.status === "approved" || a.status === "conditional").length;
    const leasesCount = scopedLeases.length;
    // Views are not tracked in the mock; approximate for the funnel demo.
    const views = applicationsCount * 9 + 40;

    const decided = decisions.map((d) => {
      const app = apps.find((a) => a.id === d.applicationId);
      if (!app?.submittedAt) return null;
      return (new Date(d.decidedAt).getTime() - new Date(app.submittedAt).getTime()) / 36e5;
    }).filter((x): x is number => x != null);
    const avgTimeToDecisionHours = decided.length ? Math.round(decided.reduce((a, b) => a + b, 0) / decided.length) : 0;

    const statuses = ["new", "incomplete", "screening", "complete", "approved", "conditional", "declined"] as const;
    const byStatus = statuses.map((status) => ({ status, count: apps.filter((a) => a.status === status).length }));

    return {
      funnel: { views, applications: applicationsCount, approvals, leases: leasesCount },
      avgTimeToDecisionHours,
      byStatus,
      vacancy: {
        total: scopedUnits.length,
        vacant: scopedUnits.filter((u) => u.status === "vacant").length,
        pending: scopedUnits.filter((u) => u.status === "pending").length,
        occupied: scopedUnits.filter((u) => u.status === "occupied").length,
      },
    };
  },

  async decide(reference: string, input: DecisionInput): Promise<Decision | null> {
    const app = applications.find((a) => a.reference === reference);
    if (!app) return null;
    const now = new Date().toISOString();
    const screening = screeningResults.find((s) => s.applicationId === app.id);
    const decision: Decision = {
      id: `dec_${app.reference}`,
      applicationId: app.id,
      outcome: input.outcome,
      reasonCode: input.reasonCode,
      reasonText: input.reasonText,
      decidedByUserId: input.byUserId ?? "user_pm",
      adverseActionIssued: input.outcome === "decline" && !!screening,
      decidedAt: now,
    };
    const existingIdx = decisions.findIndex((d) => d.applicationId === app.id);
    if (existingIdx >= 0) decisions[existingIdx] = decision;
    else decisions.push(decision);

    app.status = input.outcome === "approve" ? "approved" : input.outcome === "conditional" ? "conditional" : "declined";
    app.updatedAt = now;

    // Approve → generate a lease and notify the applicant.
    if (input.outcome === "approve" && !leases.find((l) => l.applicationId === app.id)) {
      const unit = units.find((u) => u.id === app.unitId)!;
      leases.push({
        id: `lease_${app.reference}`, applicationId: app.id, unitId: app.unitId, termMonths: app.leaseTermMonths ?? 12,
        rent: unit.rent, deposit: unit.deposit, startDate: app.desiredMoveIn ?? unit.availableFrom,
        signedByApplicant: false, signedByOperator: true, createdAt: now,
      });
    }
    messages.push({
      id: `msg_${app.reference}_dec`, applicationId: app.id, from: "operator", authorName: "Property Manager",
      body: input.outcome === "approve" ? "Great news — your application is approved. Your lease is ready to sign."
        : input.outcome === "conditional" ? "You've been approved with a condition. Please review the details."
        : "Thank you for applying. Unfortunately we can't proceed with this application.",
      createdAt: now,
    });
    return decision;
  },

  async addNote(reference: string, body: string, authorName = "Property Manager"): Promise<OperatorNote | null> {
    const app = applications.find((a) => a.reference === reference);
    if (!app || !body.trim()) return null;
    const note: OperatorNote = {
      id: `note_${app.reference}_${operatorNotes.filter((n) => n.applicationId === app.id).length + 1}`,
      applicationId: app.id, authorName, body: body.trim(), createdAt: new Date().toISOString(),
    };
    operatorNotes.push(note);
    return note;
  },

  async requestDocument(reference, docType, label, reason): Promise<DocumentRequest | null> {
    const app = applications.find((a) => a.reference === reference);
    if (!app) return null;
    const now = new Date().toISOString();
    const req: DocumentRequest = {
      id: `req_${app.reference}_${documentRequests.filter((r) => r.applicationId === app.id).length + 1}`,
      applicationId: app.id, docType: docType as DocumentType, label, reason, status: "open", createdAt: now,
    };
    documentRequests.push(req);
    app.status = "incomplete";
    app.updatedAt = now;
    messages.push({ id: `msg_${req.id}`, applicationId: app.id, from: "operator", authorName: "Property Manager", body: `We've requested a document: ${label}. ${reason}`, createdAt: now });
    return req;
  },

  async rerunScreening(reference: string): Promise<ScreeningResult | null> {
    const app = applications.find((a) => a.reference === reference);
    if (!app) return null;
    const unit = units.find((u) => u.id === app.unitId);
    const now = new Date().toISOString();
    const incomeMinor = app.monthlyIncome?.amountMinor ?? 0;
    const ratio = unit && unit.rent.amountMinor > 0 ? Math.round((incomeMinor / unit.rent.amountMinor) * 10) / 10 : 0;
    const passIncome = unit ? ratio >= unit.incomeMultiple : true;
    const result: ScreeningResult = {
      id: `scr_${app.reference}`, applicationId: app.id,
      creditScore: 700 + (incomeMinor % 60), creditOutcome: "pass",
      incomeToRent: ratio, incomeOutcome: passIncome ? "pass" : "flag",
      backgroundOutcome: "pass", evictionOutcome: "pass",
      providerRef: `SCR-EXT-${app.reference}`, completedAt: now,
    };
    const idx = screeningResults.findIndex((s) => s.applicationId === app.id);
    if (idx >= 0) screeningResults[idx] = result;
    else screeningResults.push(result);
    if (app.status === "new" || app.status === "screening") app.status = "complete";
    app.updatedAt = now;
    return result;
  },

  async listTracking(email?: string): Promise<ApplicationTracking[]> {
    const list = email
      ? applications.filter((a) => {
          const ap = applicants.find((p) => p.id === a.primaryApplicantId);
          return ap?.email.toLowerCase() === email.toLowerCase();
        })
      : [...applications];
    return list
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((a) => {
        const unit = units.find((u) => u.id === a.unitId);
        return {
          id: a.id,
          reference: a.reference,
          status: a.status,
          unitTitle: unit?.title ?? "",
          unitCode: unit?.code ?? "",
          rent: unit?.rent ?? { amountMinor: 0, currency: "PHP" as const },
          submittedAt: a.submittedAt,
          openRequests: documentRequests.filter((r) => r.applicationId === a.id && r.status === "open").length,
          hasUnreadFromOperator: messages.some((m) => m.applicationId === a.id && m.from === "operator"),
        };
      });
  },

  async addMessage(reference, body, from = "applicant"): Promise<Message | null> {
    const app = applications.find((a) => a.reference === reference);
    if (!app || !body.trim()) return null;
    const msg: Message = {
      id: `msg_${app.reference}_${messages.filter((m) => m.applicationId === app.id).length + 1}`,
      applicationId: app.id,
      from,
      authorName: from === "operator" ? "Property Manager" : undefined,
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    messages.push(msg);
    return msg;
  },

  async fulfillDocumentRequest(reference, requestId): Promise<DocumentRequest | null> {
    const app = applications.find((a) => a.reference === reference);
    if (!app) return null;
    const req = documentRequests.find((r) => r.id === requestId && r.applicationId === app.id);
    if (!req) return null;
    req.status = "fulfilled";
    req.fulfilledAt = new Date().toISOString();
    documents.push({
      id: `doc_${req.id}`,
      applicationId: app.id,
      type: req.docType,
      label: req.label,
      status: "uploaded",
      uploadedAt: req.fulfilledAt,
    });
    // If no more open requests, move an incomplete application forward.
    const stillOpen = documentRequests.some((r) => r.applicationId === app.id && r.status === "open");
    if (!stillOpen && app.status === "incomplete") app.status = "complete";
    app.updatedAt = new Date().toISOString();
    return req;
  },

  async signLease(reference, payDeposit = false): Promise<Lease | null> {
    const app = applications.find((a) => a.reference === reference);
    if (!app) return null;
    const lease = leases.find((l) => l.applicationId === app.id);
    if (!lease) return null;
    lease.signedByApplicant = true;
    if (payDeposit) {
      const dep = payments.find((p) => p.leaseId === lease.id && p.type === "deposit");
      if (dep) {
        dep.status = "paid";
        dep.paidAt = new Date().toISOString();
      }
    }
    app.updatedAt = new Date().toISOString();
    return lease;
  },
};
