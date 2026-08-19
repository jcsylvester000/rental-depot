/* ============================================================
 * RENTAL DEPOT — Prisma DataStore (Neon Postgres)
 * Implements the SAME DataStore contract as the mock store.
 * Selected by getStore() when DATABASE_URL is set.
 * ============================================================ */

import { prisma } from "@/lib/prisma";
import type {
  DataStore,
  UnitListFilter,
  ApplicationListFilter,
  CreateApplicationInput,
  AdminQueueFilter,
  DecisionInput,
  CreateUnitInput,
} from "@/lib/data/store";
import type {
  Unit, UnitSummary, Application, ApplicationDetail, ApplicationTracking,
  AdminQueueRow, AnalyticsSummary, Applicant, Property, Money, CurrencyCode,
  Message, DocumentRequest, Lease, Decision, OperatorNote, ScreeningResult,
  AppSettings, AuditEvent, User, RubricScore, ApplicationDocument, Reference,
  Payment, ApplicationParty, ApplicationStatus,
} from "@/lib/types";

/* ---------- mappers ---------- */
const iso = (d: Date | null | undefined): string | undefined => (d ? d.toISOString() : undefined);
const money = (minor: number, currency: string): Money => ({ amountMinor: minor, currency: currency as CurrencyCode });

// Prisma row shapes are structural; use loose typing at the boundary then map.
/* eslint-disable @typescript-eslint/no-explicit-any */
function mapUnit(u: any): Unit {
  return {
    id: u.id, propertyId: u.propertyId, code: u.code, title: u.title, type: u.type,
    propertyClass: u.propertyClass, permittedUse: u.permittedUse ?? undefined,
    bedrooms: u.bedrooms, bathrooms: u.bathrooms, areaSqm: u.areaSqm,
    rent: money(u.rentMinor, u.rentCurrency), deposit: money(u.depositMinor, u.depositCurrency),
    status: u.status, amenities: u.amenities, petsAllowed: u.petsAllowed,
    incomeMultiple: u.incomeMultiple, minCreditScore: u.minCreditScore ?? undefined,
    availableFrom: iso(u.availableFrom)!, description: u.description, photos: u.photos, views: u.views ?? 0, createdAt: iso(u.createdAt)!,
  };
}
function mapUnitSummary(u: any): UnitSummary {
  return {
    id: u.id, code: u.code, title: u.title, propertyClass: u.propertyClass, type: u.type, permittedUse: u.permittedUse ?? undefined,
    city: u.property?.city ?? "", region: u.property?.region ?? "",
    bedrooms: u.bedrooms, bathrooms: u.bathrooms, areaSqm: u.areaSqm, rent: money(u.rentMinor, u.rentCurrency),
    status: u.status, petsAllowed: u.petsAllowed, amenities: u.amenities, coverPhoto: u.photos?.[0], availableFrom: iso(u.availableFrom)!,
  };
}
function mapApplicant(a: any): Applicant {
  return {
    id: a.id, fullName: a.fullName, email: a.email, phone: a.phone, dateOfBirth: iso(a.dateOfBirth),
    govIdRef: a.govIdRef ?? undefined, currentAddress: a.currentAddress ?? undefined, employer: a.employer ?? undefined,
    position: a.position ?? undefined, grossMonthlyIncome: a.grossIncomeMinor != null ? money(a.grossIncomeMinor, a.grossIncomeCurrency ?? "PHP") : undefined,
    createdAt: iso(a.createdAt)!,
  };
}
function mapApplication(a: any): Application {
  return {
    id: a.id, reference: a.reference, unitId: a.unitId, primaryApplicantId: a.primaryApplicantId, status: a.status,
    applicantType: a.applicantType, businessName: a.businessName ?? undefined, businessType: a.businessType ?? undefined,
    natureOfBusiness: a.natureOfBusiness ?? undefined, yearsOperating: a.yearsOperating ?? undefined, intendedUse: a.intendedUse ?? undefined,
    desiredMoveIn: iso(a.desiredMoveIn), leaseTermMonths: a.leaseTermMonths ?? undefined,
    monthlyIncome: a.monthlyIncomeMinor != null ? money(a.monthlyIncomeMinor, a.monthlyIncomeCurrency ?? "PHP") : undefined,
    consentGivenAt: iso(a.consentGivenAt), signatureName: a.signatureName ?? undefined, feeStatus: a.feeStatus,
    rubric: (a.rubric as RubricScore | null) ?? undefined, submittedAt: iso(a.submittedAt), createdAt: iso(a.createdAt)!, updatedAt: iso(a.updatedAt)!,
  };
}
const mapDoc = (d: any): ApplicationDocument => ({ id: d.id, applicationId: d.applicationId, type: d.type, label: d.label, status: d.status, assetRef: d.assetRef ?? undefined, fileName: d.fileName ?? undefined, uploadedAt: iso(d.uploadedAt) });
const mapRef = (r: any): Reference => ({ id: r.id, applicationId: r.applicationId, name: r.name, relationship: r.relationship, contact: r.contact, kind: r.kind });
const mapScreening = (s: any): ScreeningResult => ({ id: s.id, applicationId: s.applicationId, creditScore: s.creditScore ?? undefined, creditOutcome: s.creditOutcome, incomeToRent: s.incomeToRent ?? undefined, incomeOutcome: s.incomeOutcome, backgroundOutcome: s.backgroundOutcome, evictionOutcome: s.evictionOutcome, providerRef: s.providerRef ?? undefined, completedAt: iso(s.completedAt) });
const mapDecision = (d: any): Decision => ({ id: d.id, applicationId: d.applicationId, outcome: d.outcome, reasonCode: d.reasonCode, reasonText: d.reasonText ?? undefined, decidedByUserId: d.decidedByUserId, adverseActionIssued: d.adverseActionIssued, decidedAt: iso(d.decidedAt)! });
const mapLease = (l: any): Lease => ({ id: l.id, applicationId: l.applicationId, unitId: l.unitId, termMonths: l.termMonths, rent: money(l.rentMinor, l.rentCurrency), deposit: money(l.depositMinor, l.depositCurrency), startDate: iso(l.startDate)!, signedByApplicant: l.signedByApplicant, signedByOperator: l.signedByOperator, createdAt: iso(l.createdAt)! });
const mapPayment = (p: any): Payment => ({ id: p.id, type: p.type, status: p.status, amount: money(p.amountMinor, p.amountCurrency), applicationId: p.applicationId ?? undefined, leaseId: p.leaseId ?? undefined, providerRef: p.providerRef ?? undefined, paidAt: iso(p.paidAt), createdAt: iso(p.createdAt)! });
const mapMessage = (m: any): Message => ({ id: m.id, applicationId: m.applicationId, from: m.from, authorName: m.authorName ?? undefined, body: m.body, createdAt: iso(m.createdAt)! });
const mapDocReq = (r: any): DocumentRequest => ({ id: r.id, applicationId: r.applicationId, docType: r.docType, label: r.label, reason: r.reason, status: r.status, createdAt: iso(r.createdAt)!, fulfilledAt: iso(r.fulfilledAt) });
const mapNote = (n: any): OperatorNote => ({ id: n.id, applicationId: n.applicationId, authorName: n.authorName, body: n.body, createdAt: iso(n.createdAt)! });
const mapParty = (p: any): ApplicationParty => ({ id: p.id, applicationId: p.applicationId, applicantId: p.applicantId, role: p.role, completed: p.completed, invitedAt: iso(p.invitedAt) });
const mapUser = (u: any): User => ({ id: u.id, name: u.name, email: u.email, role: u.role, propertyIds: u.propertyIds, createdAt: iso(u.createdAt)! });

const DETAIL_INCLUDE = {
  unit: { include: { property: true } },
  primaryApplicant: true,
  parties: true,
  documents: true,
  references: true,
  screening: true,
  decision: true,
  messages: { orderBy: { createdAt: "asc" as const } },
  documentRequests: true,
  notes: { orderBy: { createdAt: "desc" as const } },
  lease: { include: { payments: true } },
  payments: true,
};

function assembleDetail(a: any): ApplicationDetail {
  const leasePayments = a.lease?.payments ?? [];
  return {
    ...mapApplication(a),
    applicant: mapApplicant(a.primaryApplicant),
    unit: mapUnit(a.unit),
    parties: a.parties.map(mapParty),
    documents: a.documents.map(mapDoc),
    references: a.references.map(mapRef),
    screening: a.screening ? mapScreening(a.screening) : undefined,
    decision: a.decision ? mapDecision(a.decision) : undefined,
    messages: a.messages.map(mapMessage),
    documentRequests: a.documentRequests.map(mapDocReq),
    lease: a.lease ? mapLease(a.lease) : undefined,
    payments: [...a.payments.map(mapPayment), ...leasePayments.map(mapPayment)],
    notes: a.notes.map(mapNote),
  };
}

const REQUIRED_DOC_TYPES = ["gov_id", "payslip", "income_proof"];
function completenessOf(docs: any[], feePaid: boolean, consent: boolean): number {
  const uploaded = new Set(docs.map((d) => d.type));
  const docPct = (REQUIRED_DOC_TYPES.filter((t) => uploaded.has(t)).length / REQUIRED_DOC_TYPES.length) * 60;
  return Math.round(docPct + (consent ? 20 : 0) + (feePaid ? 20 : 0));
}

export const prismaStore: DataStore = {
  async listUnits(filter?: UnitListFilter): Promise<UnitSummary[]> {
    const where: any = {};
    if (filter?.city) where.property = { city: { contains: filter.city, mode: "insensitive" } };
    if (filter?.bedrooms != null) where.bedrooms = { gte: filter.bedrooms };
    if (filter?.petsAllowed != null) where.petsAllowed = filter.petsAllowed;
    if (filter?.status) where.status = filter.status;
    if (filter?.minRentMinor != null) where.rentMinor = { ...(where.rentMinor ?? {}), gte: filter.minRentMinor };
    if (filter?.maxRentMinor != null) where.rentMinor = { ...(where.rentMinor ?? {}), lte: filter.maxRentMinor };
    if (filter?.amenities?.length) where.amenities = { hasEvery: filter.amenities };
    const orderBy = filter?.sort === "rent_asc" ? { rentMinor: "asc" as const } : filter?.sort === "rent_desc" ? { rentMinor: "desc" as const } : { createdAt: "desc" as const };
    const rows = await prisma.unit.findMany({ where, orderBy, include: { property: true } });
    return rows.map(mapUnitSummary);
  },

  async getUnit(id: string): Promise<Unit | null> {
    const u = await prisma.unit.findUnique({ where: { id } });
    return u ? mapUnit(u) : null;
  },

  async getProperty(id: string): Promise<Property | null> {
    const p = await prisma.property.findUnique({ where: { id } });
    return p ? { id: p.id, ownerId: p.ownerId, name: p.name, addressLine: p.addressLine, city: p.city, region: p.region, postcode: p.postcode ?? undefined, lat: p.lat ?? undefined, lng: p.lng ?? undefined, createdAt: iso(p.createdAt)! } : null;
  },

  async listProperties(): Promise<Property[]> {
    const ps = await prisma.property.findMany();
    return ps.map((p) => ({ id: p.id, ownerId: p.ownerId, name: p.name, addressLine: p.addressLine, city: p.city, region: p.region, postcode: p.postcode ?? undefined, lat: p.lat ?? undefined, lng: p.lng ?? undefined, createdAt: iso(p.createdAt)! }));
  },

  async listApplications(filter?: ApplicationListFilter): Promise<Application[]> {
    const where: any = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.unitId) where.unitId = filter.unitId;
    const rows = await prisma.application.findMany({ where, orderBy: { createdAt: filter?.sort === "oldest" ? "asc" : "desc" } });
    return rows.map(mapApplication);
  },

  async getApplicationByRef(reference: string): Promise<ApplicationDetail | null> {
    const a = await prisma.application.findUnique({ where: { reference }, include: DETAIL_INCLUDE });
    return a ? assembleDetail(a) : null;
  },

  async getApplication(id: string): Promise<ApplicationDetail | null> {
    const a = await prisma.application.findUnique({ where: { id }, include: DETAIL_INCLUDE });
    return a ? assembleDetail(a) : null;
  },

  async createApplication(input: CreateApplicationInput): Promise<Application> {
    const refs = await prisma.application.findMany({ select: { reference: true } });
    const maxRef = refs.reduce((m, r) => { const n = Number(r.reference.replace(/\D/g, "")); return Number.isFinite(n) ? Math.max(m, n) : m; }, 2041);
    const nextRef = maxRef + 1;
    const now = new Date();

    // Reuse an existing applicant by email, else create one.
    const existing = await prisma.applicant.findUnique({ where: { email: input.applicant.email } });
    const applicantId = existing?.id ?? `appl_${nextRef}`;
    if (existing) {
      await prisma.applicant.update({ where: { id: existing.id }, data: {
        fullName: input.applicant.fullName, phone: input.applicant.phone,
        currentAddress: input.currentAddress ?? existing.currentAddress, employer: input.employer ?? existing.employer,
        position: input.position ?? existing.position, grossIncomeMinor: input.monthlyIncomeMinor ?? existing.grossIncomeMinor,
      } });
    } else {
      await prisma.applicant.create({ data: {
        id: applicantId, fullName: input.applicant.fullName, email: input.applicant.email, phone: input.applicant.phone,
        dateOfBirth: input.applicant.dateOfBirth ? new Date(input.applicant.dateOfBirth) : undefined,
        currentAddress: input.currentAddress, employer: input.employer, position: input.position,
        grossIncomeMinor: input.monthlyIncomeMinor ?? undefined, grossIncomeCurrency: input.monthlyIncomeMinor ? "PHP" : undefined, createdAt: now,
      } });
    }

    const app = await prisma.application.create({ data: {
      id: `app_${nextRef}`, reference: `APP-${nextRef}`, unitId: input.unitId, primaryApplicantId: applicantId, status: "new",
      applicantType: input.applicantType ?? "individual", businessName: input.businessName, businessType: input.businessType,
      natureOfBusiness: input.natureOfBusiness, yearsOperating: input.yearsOperating, intendedUse: input.intendedUse,
      desiredMoveIn: input.desiredMoveIn ? new Date(input.desiredMoveIn) : undefined, leaseTermMonths: input.leaseTermMonths ?? 12,
      monthlyIncomeMinor: input.monthlyIncomeMinor ?? undefined, monthlyIncomeCurrency: input.monthlyIncomeMinor ? "PHP" : undefined,
      consentGivenAt: input.consent ? now : undefined, signatureName: input.signatureName, feeStatus: input.feePaid ? "paid" : "pending",
      submittedAt: now, createdAt: now, updatedAt: now,
    } });

    await prisma.applicationParty.create({ data: { id: `party_${nextRef}`, applicationId: app.id, applicantId, role: "primary", completed: true } });
    if (input.documentsUploaded?.length) {
      await prisma.document.createMany({ data: input.documentsUploaded.map((d, i) => ({ id: `doc_${nextRef}_${i}`, applicationId: app.id, type: d.type as any, label: d.label ?? d.type, status: "uploaded" as const, assetRef: d.assetRef, fileName: d.fileName, uploadedAt: now })) });
    }
    return mapApplication(app);
  },

  async listTracking(email?: string): Promise<ApplicationTracking[]> {
    const where: any = {};
    if (email) where.primaryApplicant = { email: { equals: email, mode: "insensitive" } };
    const rows = await prisma.application.findMany({ where, orderBy: { createdAt: "desc" }, include: { unit: true, documentRequests: true, messages: true } });
    return rows.map((a) => ({
      id: a.id, reference: a.reference, status: a.status, unitTitle: a.unit.title, unitCode: a.unit.code,
      rent: money(a.unit.rentMinor, a.unit.rentCurrency), submittedAt: iso(a.submittedAt),
      openRequests: a.documentRequests.filter((r) => r.status === "open").length,
      hasUnreadFromOperator: a.messages.some((m) => m.from === "operator"),
    }));
  },

  async addMessage(reference, body, from = "applicant"): Promise<Message | null> {
    const app = await prisma.application.findUnique({ where: { reference }, select: { id: true, reference: true } });
    if (!app || !body.trim()) return null;
    const count = await prisma.message.count({ where: { applicationId: app.id } });
    const m = await prisma.message.create({ data: { id: `msg_${app.reference}_${count + 1}`, applicationId: app.id, from, authorName: from === "operator" ? "Property Manager" : undefined, body: body.trim(), createdAt: new Date() } });
    return mapMessage(m);
  },

  async fulfillDocumentRequest(reference, requestId, asset): Promise<DocumentRequest | null> {
    const app = await prisma.application.findUnique({ where: { reference }, select: { id: true, status: true } });
    if (!app) return null;
    const req = await prisma.documentRequest.findFirst({ where: { id: requestId, applicationId: app.id } });
    if (!req) return null;
    const now = new Date();
    const updated = await prisma.documentRequest.update({ where: { id: req.id }, data: { status: "fulfilled", fulfilledAt: now } });
    await prisma.document.create({ data: { id: `doc_${req.id}`, applicationId: app.id, type: req.docType, label: req.label, status: "uploaded", assetRef: asset?.assetRef, fileName: asset?.fileName, uploadedAt: now } });
    const stillOpen = await prisma.documentRequest.count({ where: { applicationId: app.id, status: "open" } });
    if (stillOpen === 0 && app.status === "incomplete") await prisma.application.update({ where: { id: app.id }, data: { status: "complete", updatedAt: now } });
    return mapDocReq(updated);
  },

  async signLease(reference, payDeposit = false): Promise<Lease | null> {
    const app = await prisma.application.findUnique({ where: { reference }, select: { id: true } });
    if (!app) return null;
    const lease = await prisma.lease.findUnique({ where: { applicationId: app.id } });
    if (!lease) return null;
    const updated = await prisma.lease.update({ where: { id: lease.id }, data: { signedByApplicant: true } });
    if (payDeposit) await prisma.payment.updateMany({ where: { leaseId: lease.id, type: "deposit" }, data: { status: "paid", paidAt: new Date() } });
    return mapLease(updated);
  },

  async listAdminQueue(filter?: AdminQueueFilter): Promise<AdminQueueRow[]> {
    const rows = await prisma.application.findMany({ include: { primaryApplicant: true, unit: true, screening: true, documents: true, documentRequests: true } });
    let mapped: AdminQueueRow[] = rows.map((a) => {
      const openReq = a.documentRequests.some((r) => r.status === "open");
      const flags: string[] = [];
      if (a.screening?.evictionOutcome === "fail" || a.screening?.evictionOutcome === "flag") flags.push("eviction");
      if (a.screening?.backgroundOutcome === "fail" || a.screening?.backgroundOutcome === "flag") flags.push("background");
      if (a.screening?.incomeToRent != null && a.screening.incomeToRent < a.unit.incomeMultiple) flags.push("income_low");
      if (openReq || a.status === "incomplete") flags.push("incomplete");
      const rubric = a.rubric as RubricScore | null;
      return {
        id: a.id, reference: a.reference, applicantName: a.primaryApplicant.fullName, applicantEmail: a.primaryApplicant.email,
        unitId: a.unitId, unitCode: a.unit.code, unitTitle: a.unit.title, propertyClass: a.unit.propertyClass, applicantType: a.applicantType,
        status: a.status, submittedAt: iso(a.submittedAt),
        completenessPct: completenessOf(a.documents, a.feeStatus === "paid", !!a.consentGivenAt), score: rubric?.overall,
        incomeToRent: a.screening?.incomeToRent ?? undefined, creditScore: a.screening?.creditScore ?? undefined, flags,
      };
    });
    if (filter?.status) mapped = mapped.filter((r) => r.status === filter.status);
    if (filter?.unitId) mapped = mapped.filter((r) => r.unitId === filter.unitId);
    if (filter?.onlyIncomplete) mapped = mapped.filter((r) => r.flags.includes("incomplete"));
    if (filter?.search) { const q = filter.search.toLowerCase(); mapped = mapped.filter((r) => r.reference.toLowerCase().includes(q) || r.applicantName.toLowerCase().includes(q) || r.applicantEmail.toLowerCase().includes(q) || r.unitCode.toLowerCase().includes(q)); }
    if (filter?.sort === "oldest") mapped.sort((a, b) => ((a.submittedAt ?? "") < (b.submittedAt ?? "") ? -1 : 1));
    else if (filter?.sort === "score") mapped.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    else if (filter?.sort === "completeness") mapped.sort((a, b) => b.completenessPct - a.completenessPct);
    else mapped.sort((a, b) => ((a.submittedAt ?? "") < (b.submittedAt ?? "") ? 1 : -1));
    return mapped;
  },

  async getAnalytics(propertyId?: string): Promise<AnalyticsSummary> {
    const unitWhere = propertyId ? { propertyId } : {};
    const [allUnits, apps, leaseCount, decisions] = await Promise.all([
      prisma.unit.findMany({ where: unitWhere }),
      prisma.application.findMany({ where: propertyId ? { unit: { propertyId } } : {}, include: { decision: true } }),
      prisma.lease.count({ where: propertyId ? { unit: { propertyId } } : {} }),
      prisma.decision.findMany({ include: { application: true } }),
    ]);
    const applicationsCount = apps.length;
    const approvals = apps.filter((a) => a.status === "approved" || a.status === "conditional").length;
    const views = allUnits.reduce((sum, u) => sum + (u.views ?? 0), 0);
    const decided = decisions.map((d) => d.application?.submittedAt ? (d.decidedAt.getTime() - d.application.submittedAt.getTime()) / 36e5 : null).filter((x): x is number => x != null);
    const avgTimeToDecisionHours = decided.length ? Math.round(decided.reduce((a, b) => a + b, 0) / decided.length) : 0;
    const statuses: ApplicationStatus[] = ["new", "incomplete", "screening", "complete", "approved", "conditional", "declined"];
    return {
      funnel: { views, applications: applicationsCount, approvals, leases: leaseCount },
      avgTimeToDecisionHours,
      byStatus: statuses.map((status) => ({ status, count: apps.filter((a) => a.status === status).length })),
      vacancy: { total: allUnits.length, vacant: allUnits.filter((u) => u.status === "vacant").length, pending: allUnits.filter((u) => u.status === "pending").length, occupied: allUnits.filter((u) => u.status === "occupied").length },
    };
  },

  async decide(reference: string, input: DecisionInput): Promise<Decision | null> {
    const app = await prisma.application.findUnique({ where: { reference }, include: { screening: true, unit: true, lease: true } });
    if (!app) return null;
    const now = new Date();
    const decision = await prisma.decision.upsert({
      where: { applicationId: app.id },
      update: { outcome: input.outcome, reasonCode: input.reasonCode, reasonText: input.reasonText, adverseActionIssued: input.outcome === "decline" && !!app.screening, decidedAt: now, decidedByUserId: input.byUserId ?? "user_pm" },
      create: { id: `dec_${app.reference}`, applicationId: app.id, outcome: input.outcome, reasonCode: input.reasonCode, reasonText: input.reasonText, decidedByUserId: input.byUserId ?? "user_pm", adverseActionIssued: input.outcome === "decline" && !!app.screening, decidedAt: now },
    });
    const status = input.outcome === "approve" ? "approved" : input.outcome === "conditional" ? "conditional" : "declined";
    await prisma.application.update({ where: { id: app.id }, data: { status, updatedAt: now } });
    if (input.outcome === "approve" && !app.lease) {
      await prisma.lease.create({ data: { id: `lease_${app.reference}`, applicationId: app.id, unitId: app.unitId, termMonths: app.leaseTermMonths ?? 12, rentMinor: app.unit.rentMinor, rentCurrency: app.unit.rentCurrency, depositMinor: app.unit.depositMinor, depositCurrency: app.unit.depositCurrency, startDate: app.desiredMoveIn ?? app.unit.availableFrom, signedByApplicant: false, signedByOperator: true, createdAt: now } });
    }
    const count = await prisma.message.count({ where: { applicationId: app.id } });
    await prisma.message.create({ data: { id: `msg_${app.reference}_${count + 1}`, applicationId: app.id, from: "operator", authorName: "Property Manager", body: input.outcome === "approve" ? "Great news — your application is approved. Your lease is ready to sign." : input.outcome === "conditional" ? "You've been approved with a condition. Please review the details." : "Thank you for applying. Unfortunately we can't proceed with this application.", createdAt: now } });
    return mapDecision(decision);
  },

  async addNote(reference, body, authorName = "Property Manager"): Promise<OperatorNote | null> {
    const app = await prisma.application.findUnique({ where: { reference }, select: { id: true } });
    if (!app || !body.trim()) return null;
    const count = await prisma.operatorNote.count({ where: { applicationId: app.id } });
    const n = await prisma.operatorNote.create({ data: { id: `note_${reference}_${count + 1}`, applicationId: app.id, authorName, body: body.trim(), createdAt: new Date() } });
    return mapNote(n);
  },

  async requestDocument(reference, docType, label, reason): Promise<DocumentRequest | null> {
    const app = await prisma.application.findUnique({ where: { reference }, select: { id: true } });
    if (!app) return null;
    const now = new Date();
    const count = await prisma.documentRequest.count({ where: { applicationId: app.id } });
    const req = await prisma.documentRequest.create({ data: { id: `req_${reference}_${count + 1}`, applicationId: app.id, docType: docType as any, label, reason, status: "open", createdAt: now } });
    await prisma.application.update({ where: { id: app.id }, data: { status: "incomplete", updatedAt: now } });
    const mCount = await prisma.message.count({ where: { applicationId: app.id } });
    await prisma.message.create({ data: { id: `msg_${req.id}_${mCount}`, applicationId: app.id, from: "operator", authorName: "Property Manager", body: `We've requested a document: ${label}. ${reason}`, createdAt: now } });
    return mapDocReq(req);
  },

  async rerunScreening(reference: string): Promise<ScreeningResult | null> {
    const app = await prisma.application.findUnique({ where: { reference }, include: { unit: true } });
    if (!app) return null;
    const now = new Date();
    const incomeMinor = app.monthlyIncomeMinor ?? 0;
    const ratio = app.unit.rentMinor > 0 ? Math.round((incomeMinor / app.unit.rentMinor) * 10) / 10 : 0;
    const passIncome = ratio >= app.unit.incomeMultiple;
    const data = { creditScore: 700 + (incomeMinor % 60), creditOutcome: "pass" as const, incomeToRent: ratio, incomeOutcome: (passIncome ? "pass" : "flag") as "pass" | "flag", backgroundOutcome: "pass" as const, evictionOutcome: "pass" as const, providerRef: `SCR-EXT-${app.reference}`, completedAt: now };
    const result = await prisma.screeningResult.upsert({ where: { applicationId: app.id }, update: data, create: { id: `scr_${app.reference}`, applicationId: app.id, ...data } });
    if (app.status === "new" || app.status === "screening") await prisma.application.update({ where: { id: app.id }, data: { status: "complete", updatedAt: now } });
    return mapScreening(result);
  },

  async listUnitsAdmin(): Promise<Unit[]> {
    const rows = await prisma.unit.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(mapUnit);
  },

  async updateUnit(id: string, patch: Partial<Unit>): Promise<Unit | null> {
    const data: any = {};
    if (patch.status) data.status = patch.status;
    if (patch.incomeMultiple != null) data.incomeMultiple = patch.incomeMultiple;
    if (patch.minCreditScore != null) data.minCreditScore = patch.minCreditScore;
    if (patch.petsAllowed != null) data.petsAllowed = patch.petsAllowed;
    if (patch.rent) { data.rentMinor = patch.rent.amountMinor; data.rentCurrency = patch.rent.currency; }
    try {
      const u = await prisma.unit.update({ where: { id }, data });
      return mapUnit(u);
    } catch { return null; }
  },

  async createUnit(input: CreateUnitInput): Promise<Unit> {
    const u = await prisma.unit.create({ data: {
      id: `unit_new_${input.code.toLowerCase()}`, propertyId: input.propertyId, code: input.code, title: input.title, type: input.type,
      propertyClass: input.propertyClass ?? "residential", permittedUse: input.permittedUse,
      bedrooms: input.bedrooms, bathrooms: input.bathrooms, areaSqm: input.areaSqm, rentMinor: input.rentMinor, depositMinor: input.depositMinor,
      status: "vacant", amenities: [], petsAllowed: input.petsAllowed, incomeMultiple: input.incomeMultiple, availableFrom: new Date(input.availableFrom), description: input.description, photos: [], createdAt: new Date(),
    } });
    return mapUnit(u);
  },

  async getSettings(): Promise<AppSettings> {
    const s = await prisma.settings.findUnique({ where: { id: "singleton" } });
    if (!s) throw new Error("Settings not seeded");
    return {
      applicationFee: money(s.applicationFeeMinor, s.applicationFeeCurrency), jurisdictionNote: s.jurisdictionNote,
      screening: s.screening as unknown as AppSettings["screening"], branding: s.branding as unknown as AppSettings["branding"],
      templates: s.templates as unknown as AppSettings["templates"], leaseClauses: s.leaseClauses, integrations: s.integrations as unknown as AppSettings["integrations"],
    };
  },

  async updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
    const data: any = {};
    if (patch.applicationFee) { data.applicationFeeMinor = patch.applicationFee.amountMinor; data.applicationFeeCurrency = patch.applicationFee.currency; }
    if (patch.jurisdictionNote != null) data.jurisdictionNote = patch.jurisdictionNote;
    if (patch.screening) data.screening = patch.screening;
    if (patch.branding) data.branding = patch.branding;
    if (patch.templates) data.templates = patch.templates;
    if (patch.leaseClauses != null) data.leaseClauses = patch.leaseClauses;
    if (patch.integrations) data.integrations = patch.integrations;
    await prisma.settings.update({ where: { id: "singleton" }, data });
    return this.getSettings();
  },

  async listUsers(): Promise<User[]> {
    const us = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
    return us.map(mapUser);
  },

  async addUser(input): Promise<User> {
    const count = await prisma.user.count();
    const u = await prisma.user.create({ data: { id: `user_${count + 1}`, name: input.name, email: input.email, role: input.role, propertyIds: input.propertyIds ?? [], createdAt: new Date() } });
    return mapUser(u);
  },

  async getAuditLog(): Promise<AuditEvent[]> {
    const [apps, screenings, decisions, docReqs, notes, leases] = await Promise.all([
      prisma.application.findMany({ include: { primaryApplicant: true } }),
      prisma.screeningResult.findMany(),
      prisma.decision.findMany(),
      prisma.documentRequest.findMany(),
      prisma.operatorNote.findMany(),
      prisma.lease.findMany(),
    ]);
    const refOf = (appId: string) => apps.find((a) => a.id === appId)?.reference;
    const events: AuditEvent[] = [];
    apps.forEach((a) => {
      if (a.submittedAt) events.push({ id: `au_sub_${a.id}`, createdAt: a.submittedAt.toISOString(), actor: a.primaryApplicant.fullName, action: "submitted application", entity: "Application", reference: a.reference });
      if (a.consentGivenAt) events.push({ id: `au_con_${a.id}`, createdAt: a.consentGivenAt.toISOString(), actor: a.primaryApplicant.fullName, action: "gave screening consent", entity: "Consent", reference: a.reference, detail: "Timestamped consent recorded" });
    });
    screenings.forEach((s) => { if (s.completedAt) events.push({ id: `au_scr_${s.id}`, createdAt: s.completedAt.toISOString(), actor: "System", action: "completed screening", entity: "Screening", reference: refOf(s.applicationId), detail: `Provider ${s.providerRef ?? "—"}` }); });
    decisions.forEach((d) => events.push({ id: `au_dec_${d.id}`, createdAt: d.decidedAt.toISOString(), actor: "Operator", action: `decision: ${d.outcome}`, entity: "Decision", reference: refOf(d.applicationId), detail: d.adverseActionIssued ? "Adverse-action notice issued" : d.reasonCode }));
    docReqs.forEach((r) => events.push({ id: `au_req_${r.id}`, createdAt: r.createdAt.toISOString(), actor: "Operator", action: "requested document", entity: "DocumentRequest", reference: refOf(r.applicationId), detail: r.label }));
    notes.forEach((n) => events.push({ id: `au_note_${n.id}`, createdAt: n.createdAt.toISOString(), actor: n.authorName, action: "added internal note", entity: "Note", reference: refOf(n.applicationId) }));
    leases.forEach((l) => events.push({ id: `au_lease_${l.id}`, createdAt: l.createdAt.toISOString(), actor: "Operator", action: "generated lease", entity: "Lease", reference: refOf(l.applicationId) }));
    return events.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },
};
