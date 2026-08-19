/* ============================================================
 * RENTAL DEPOT — DataStore interface (repository contract)
 * ------------------------------------------------------------
 * Route handlers depend ONLY on this interface. Phase 0 provides
 * a mock implementation; Phase 6 swaps in a Prisma-backed one
 * WITHOUT changing any route handler or the API surface.
 * ============================================================ */

import type {
  Application,
  ApplicationDetail,
  ApplicationTracking,
  AdminQueueRow,
  AnalyticsSummary,
  Property,
  Unit,
  UnitSummary,
  UnitStatus,
  Amenity,
  ApplicationStatus,
  Message,
  DocumentRequest,
  Lease,
  Decision,
  DecisionOutcome,
  OperatorNote,
  ScreeningResult,
} from "@/lib/types";

export interface UnitListFilter {
  city?: string;
  minRentMinor?: number;
  maxRentMinor?: number;
  bedrooms?: number;
  petsAllowed?: boolean;
  amenities?: Amenity[];
  status?: UnitStatus;
  availableFrom?: string;
  sort?: "newest" | "rent_asc" | "rent_desc";
}

export interface ApplicationListFilter {
  status?: ApplicationStatus;
  unitId?: string;
  search?: string;
  sort?: "newest" | "oldest" | "completeness" | "score";
}

export interface CreateApplicationInput {
  unitId: string;
  applicant: { fullName: string; email: string; phone: string; dateOfBirth?: string };
  currentAddress?: string;
  employer?: string;
  position?: string;
  monthlyIncomeMinor?: number;
  desiredMoveIn?: string;
  leaseTermMonths?: number;
  occupants?: number;
  pets?: string;
  documentsUploaded?: string[]; // document type keys marked uploaded
  consent: boolean;
  signatureName: string;
  feePaid: boolean;
}

export interface DataStore {
  // Discovery
  listUnits(filter?: UnitListFilter): Promise<UnitSummary[]>;
  getUnit(id: string): Promise<Unit | null>;
  getProperty(id: string): Promise<Property | null>;
  listProperties(): Promise<Property[]>;

  // Applications
  listApplications(filter?: ApplicationListFilter): Promise<Application[]>;
  getApplicationByRef(reference: string): Promise<ApplicationDetail | null>;
  getApplication(id: string): Promise<ApplicationDetail | null>;
  createApplication(input: CreateApplicationInput): Promise<Application>;

  // Post-submission (Phase 3)
  listTracking(email?: string): Promise<ApplicationTracking[]>;
  addMessage(reference: string, body: string, from?: "applicant" | "operator"): Promise<Message | null>;
  fulfillDocumentRequest(reference: string, requestId: string): Promise<DocumentRequest | null>;
  signLease(reference: string, payDeposit?: boolean): Promise<Lease | null>;

  // Operator (Phase 4)
  listAdminQueue(filter?: AdminQueueFilter): Promise<AdminQueueRow[]>;
  getAnalytics(propertyId?: string): Promise<AnalyticsSummary>;
  decide(reference: string, input: DecisionInput): Promise<Decision | null>;
  addNote(reference: string, body: string, authorName?: string): Promise<OperatorNote | null>;
  requestDocument(reference: string, docType: string, label: string, reason: string): Promise<DocumentRequest | null>;
  rerunScreening(reference: string): Promise<ScreeningResult | null>;
}

export interface AdminQueueFilter {
  status?: ApplicationStatus;
  unitId?: string;
  search?: string;
  onlyIncomplete?: boolean;
  sort?: "newest" | "oldest" | "score" | "completeness";
}

export interface DecisionInput {
  outcome: DecisionOutcome;
  reasonCode: string;
  reasonText?: string;
  byUserId?: string;
}

/**
 * Resolves the active DataStore. Today: the mock store.
 * Phase 6 flips this to the Prisma store behind the same call.
 */
let _store: DataStore | null = null;

export async function getStore(): Promise<DataStore> {
  if (_store) return _store;
  const { mockStore } = await import("@/lib/mock/store");
  _store = mockStore;
  return _store;
}
