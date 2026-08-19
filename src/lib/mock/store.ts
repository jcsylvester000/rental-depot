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
} from "@/lib/data/store";
import type {
  Unit,
  UnitSummary,
  Application,
  ApplicationDetail,
  ApplicationTracking,
  ApplicationDocument,
  DocumentType,
  Message,
  DocumentRequest,
  Lease,
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
} from "@/lib/mock/seed";

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
    };
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
