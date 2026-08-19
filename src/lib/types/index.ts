/* ============================================================
 * RENTAL DEPOT — Shared Data Contract
 * ------------------------------------------------------------
 * The single source of truth for entity shapes and enums.
 * Consumed by: the web front end, the HTTP API layer, the mock
 * data layer, and (Phase 6) the Prisma schema — which is
 * generated to match these types.
 *
 * Conventions:
 *  - All IDs are strings (UUID-like).
 *  - All timestamps are ISO-8601 strings, so every entity is
 *    JSON-serialisable and safe to send over the API to web AND
 *    the future mobile client. No Date objects cross the wire.
 *  - Money is stored as integer minor units (centavos) + a
 *    currency code, to avoid float rounding. Default PHP.
 * ============================================================ */

export type ISODateString = string;
export type ID = string;
export type CurrencyCode = "PHP" | "USD";

/** Money as integer minor units (e.g. 2850000 = ₱28,500.00). */
export interface Money {
  amountMinor: number;
  currency: CurrencyCode;
}

/* ------------------------------ Enums ------------------------------ */

export const APPLICATION_STATUSES = [
  "new",
  "incomplete",
  "screening",
  "complete",
  "approved",
  "conditional",
  "declined",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const PARTY_ROLES = ["primary", "co_applicant", "occupant", "guarantor"] as const;
export type PartyRole = (typeof PARTY_ROLES)[number];

export const UNIT_STATUSES = ["vacant", "pending", "occupied"] as const;
export type UnitStatus = (typeof UNIT_STATUSES)[number];

export const DOCUMENT_TYPES = [
  "gov_id",
  "payslip",
  "income_proof",
  "bank_statement",
  "reference_letter",
  "other",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_STATUSES = ["required", "uploaded", "verified", "rejected"] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export const SCREENING_CHECK_OUTCOMES = ["pass", "flag", "fail", "pending"] as const;
export type ScreeningCheckOutcome = (typeof SCREENING_CHECK_OUTCOMES)[number];

export const DECISION_OUTCOMES = ["approve", "conditional", "decline"] as const;
export type DecisionOutcome = (typeof DECISION_OUTCOMES)[number];

export const PAYMENT_TYPES = ["application_fee", "deposit", "first_month", "rent"] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];

export const PAYMENT_STATUSES = ["pending", "paid", "refunded", "failed", "waived"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const USER_ROLES = ["applicant", "agent", "manager", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const UNIT_TYPES = ["studio", "1br", "2br", "3br", "4br_plus", "commercial", "office", "retail", "warehouse"] as const;
export type UnitType = (typeof UNIT_TYPES)[number];

export const PROPERTY_CLASSES = ["residential", "commercial"] as const;
export type PropertyClass = (typeof PROPERTY_CLASSES)[number];

export const APPLICANT_TYPES = ["individual", "business"] as const;
export type ApplicantType = (typeof APPLICANT_TYPES)[number];

export const AMENITIES = [
  "parking",
  "pets_allowed",
  "in_unit_laundry",
  "elevator",
  "security",
  "furnished",
  "aircon",
  "balcony",
  "gym",
  "pool",
] as const;
export type Amenity = (typeof AMENITIES)[number];

/* ------------------------------ Entities ------------------------------ */

export interface Owner {
  id: ID;
  name: string;
  contactEmail: string;
  createdAt: ISODateString;
}

export interface Property {
  id: ID;
  ownerId: ID;
  name: string;
  addressLine: string;
  city: string;
  region: string;
  postcode?: string;
  lat?: number;
  lng?: number;
  createdAt: ISODateString;
}

export interface Unit {
  id: ID;
  propertyId: ID;
  code: string; // e.g. "GRD-4821"
  title: string;
  type: UnitType;
  propertyClass: PropertyClass;
  permittedUse?: string; // commercial: e.g. "Retail / F&B"
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  rent: Money;
  deposit: Money;
  status: UnitStatus;
  amenities: Amenity[];
  petsAllowed: boolean;
  /** Per-unit screening criteria, set before listing. */
  incomeMultiple: number; // e.g. 3 => income must be >= 3x rent
  minCreditScore?: number;
  availableFrom: ISODateString;
  description: string;
  photos: string[]; // URLs (Cloudinary later)
  views: number; // listing view count (drives the analytics funnel)
  published?: boolean; // false = owner-submitted, awaiting operator review (hidden from public)
  createdAt: ISODateString;
}

export type ChatStatus = "pending" | "accepted" | "declined";

export interface Applicant {
  id: ID;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: ISODateString;
  /** Sensitive: encrypted at rest in Phase 6. Reference only. */
  govIdRef?: string;
  currentAddress?: string;
  employer?: string;
  position?: string;
  grossMonthlyIncome?: Money;
  createdAt: ISODateString;
}

export interface ApplicationParty {
  id: ID;
  applicationId: ID;
  applicantId: ID;
  role: PartyRole;
  completed: boolean;
  invitedAt?: ISODateString;
}

export interface ApplicationDocument {
  id: ID;
  applicationId: ID;
  type: DocumentType;
  label: string;
  status: DocumentStatus;
  /** Cloudinary asset reference (Phase 7). Null until uploaded. */
  assetRef?: string;
  fileName?: string;
  uploadedAt?: ISODateString;
}

export interface Reference {
  id: ID;
  applicationId: ID;
  name: string;
  relationship: string;
  contact: string;
  kind: "personal" | "landlord" | "professional";
}

export interface ScreeningResult {
  id: ID;
  applicationId: ID;
  creditScore?: number;
  creditOutcome: ScreeningCheckOutcome;
  incomeToRent?: number; // ratio, e.g. 3.4
  incomeOutcome: ScreeningCheckOutcome;
  backgroundOutcome: ScreeningCheckOutcome;
  evictionOutcome: ScreeningCheckOutcome;
  providerRef?: string;
  completedAt?: ISODateString;
}

export interface RubricScore {
  incomeStability: number;
  creditHistory: number;
  rentalHistory: number;
  completeness: number;
  overall: number;
}

export interface Decision {
  id: ID;
  applicationId: ID;
  outcome: DecisionOutcome;
  reasonCode: string;
  reasonText?: string;
  decidedByUserId: ID;
  adverseActionIssued: boolean;
  decidedAt: ISODateString;
}

export interface Application {
  id: ID;
  reference: string; // e.g. "APP-2041"
  unitId: ID;
  primaryApplicantId: ID;
  status: ApplicationStatus;
  applicantType: ApplicantType;
  // Commercial / business applications
  businessName?: string;
  businessType?: string;
  natureOfBusiness?: string;
  yearsOperating?: number;
  intendedUse?: string;
  desiredMoveIn?: ISODateString;
  leaseTermMonths?: number;
  monthlyIncome?: Money;
  consentGivenAt?: ISODateString;
  signatureName?: string;
  feeStatus: PaymentStatus;
  rubric?: RubricScore;
  // Property chat invitation state (thread stays gated until the recipient accepts).
  chatStatus?: ChatStatus;
  chatInitiatedBy?: "applicant" | "operator";
  chatRequestedAt?: ISODateString;
  chatDecidedAt?: ISODateString;
  submittedAt?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Lease {
  id: ID;
  applicationId: ID;
  unitId: ID;
  termMonths: number;
  rent: Money;
  deposit: Money;
  startDate: ISODateString;
  signedByApplicant: boolean;
  signedByOperator: boolean;
  createdAt: ISODateString;
}

export interface Payment {
  id: ID;
  type: PaymentType;
  status: PaymentStatus;
  amount: Money;
  applicationId?: ID;
  leaseId?: ID;
  providerRef?: string;
  paidAt?: ISODateString;
  createdAt: ISODateString;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  role: UserRole;
  /** Property scoping for operators (empty => all). */
  propertyIds: ID[];
  createdAt: ISODateString;
}

export interface Message {
  id: ID;
  applicationId: ID;
  from: "applicant" | "operator" | "system";
  authorName?: string;
  body: string;
  createdAt: ISODateString;
}

export interface DocumentRequest {
  id: ID;
  applicationId: ID;
  docType: DocumentType;
  label: string;
  reason: string;
  status: "open" | "fulfilled";
  createdAt: ISODateString;
  fulfilledAt?: ISODateString;
}

export interface OperatorNote {
  id: ID;
  applicationId: ID;
  authorName: string;
  body: string;
  createdAt: ISODateString;
}

export interface AuditLogEntry {
  id: ID;
  actorType: "applicant" | "operator" | "system";
  actorId?: ID;
  action: string;
  entityType: string;
  entityId: ID;
  detail?: string;
  createdAt: ISODateString;
}

/* ---------------------- Composite / read models ---------------------- */

/** A listing card as the discovery UI consumes it. */
export interface UnitSummary {
  id: ID;
  code: string;
  title: string;
  propertyClass: PropertyClass;
  type: UnitType;
  permittedUse?: string;
  city: string;
  region: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  rent: Money;
  status: UnitStatus;
  petsAllowed: boolean;
  amenities: Amenity[];
  coverPhoto?: string;
  availableFrom: ISODateString;
}

/** The consolidated applicant view the operator review workspace consumes. */
export interface ApplicationDetail extends Application {
  applicant: Applicant;
  unit: Unit;
  parties: ApplicationParty[];
  documents: ApplicationDocument[];
  references: Reference[];
  screening?: ScreeningResult;
  decision?: Decision;
  messages: Message[];
  documentRequests: DocumentRequest[];
  lease?: Lease;
  payments: Payment[];
  notes: OperatorNote[];
}

/** A row in the operator application queue. */
export interface AdminQueueRow {
  id: ID;
  reference: string;
  applicantName: string;
  applicantEmail: string;
  unitId: ID;
  unitCode: string;
  unitTitle: string;
  propertyClass: PropertyClass;
  applicantType: ApplicantType;
  status: ApplicationStatus;
  submittedAt?: ISODateString;
  completenessPct: number;
  score?: number;
  incomeToRent?: number;
  creditScore?: number;
  flags: string[]; // lawful flags only (e.g. "eviction", "income_low")
  chatStatus?: ChatStatus;
  chatInitiatedBy?: "applicant" | "operator";
}

export interface ScreeningRules {
  incomeMultiple: number;
  minCreditScore: number;
  flagNotReject: boolean; // flag for human review vs auto-decline
  requireConsentBeforeScreening: boolean;
}

export interface MessageTemplate {
  id: ID;
  name: string;
  body: string;
}

export interface Branding {
  productName: string;
  accent: string;
  applicantIntro: string;
}

export interface IntegrationStatus {
  key: string;
  name: string;
  category: "screening" | "payments" | "esign" | "portal";
  connected: boolean;
  detail: string;
}

export interface AppSettings {
  applicationFee: Money;
  jurisdictionNote: string;
  screening: ScreeningRules;
  branding: Branding;
  templates: MessageTemplate[];
  leaseClauses: string;
  integrations: IntegrationStatus[];
}

/** Derived audit event for the compliance log. */
export interface AuditEvent {
  id: ID;
  createdAt: ISODateString;
  actor: string;
  action: string;
  entity: string;
  reference?: string;
  detail?: string;
}

/** Operator analytics rollup. */
export interface AnalyticsSummary {
  funnel: { views: number; applications: number; approvals: number; leases: number };
  avgTimeToDecisionHours: number;
  byStatus: { status: ApplicationStatus; count: number }[];
  vacancy: { total: number; vacant: number; pending: number; occupied: number };
}

/** A compact tracking card for the applicant's status list. */
export interface ApplicationTracking {
  id: ID;
  reference: string;
  status: ApplicationStatus;
  unitTitle: string;
  unitCode: string;
  rent: Money;
  submittedAt?: ISODateString;
  openRequests: number;
  hasUnreadFromOperator: boolean;
}
