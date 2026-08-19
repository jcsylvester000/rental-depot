/* ============================================================
 * RENTAL DEPOT — Mock seed data
 * Deterministic, typed seed content mirroring the data contract.
 * The Maria Santos / APP-2041 record intentionally links the
 * applicant side to the operator side (same record, one story).
 * Replaced by a Prisma seed script in Phase 6.
 * ============================================================ */

import { money } from "@/lib/money";
import type {
  Owner,
  Property,
  Unit,
  Applicant,
  Application,
  ApplicationParty,
  ApplicationDocument,
  Reference,
  ScreeningResult,
  Decision,
  User,
} from "@/lib/types";

export const owners: Owner[] = [
  {
    id: "own_1",
    name: "Rental Depot Estates",
    contactEmail: "estates@rentaldepot.example",
    createdAt: "2026-01-04T02:00:00.000Z",
  },
];

export const properties: Property[] = [
  {
    id: "prop_1",
    ownerId: "own_1",
    name: "Katipunan Garden Residences",
    addressLine: "12 Katipunan Ave",
    city: "Quezon City",
    region: "Metro Manila",
    postcode: "1108",
    lat: 14.6396,
    lng: 121.0745,
    createdAt: "2026-01-05T02:00:00.000Z",
  },
  {
    id: "prop_2",
    ownerId: "own_1",
    name: "Makati Skyline Lofts",
    addressLine: "88 Legazpi St",
    city: "Makati",
    region: "Metro Manila",
    postcode: "1229",
    lat: 14.5547,
    lng: 121.0244,
    createdAt: "2026-01-05T02:00:00.000Z",
  },
];

export const units: Unit[] = [
  {
    id: "unit_1",
    propertyId: "prop_1",
    code: "GRD-4821",
    title: "Bright 2-bedroom near Katipunan",
    type: "2br",
    bedrooms: 2,
    bathrooms: 1,
    areaSqm: 54,
    rent: money(2850000),
    deposit: money(5700000),
    status: "pending",
    amenities: ["parking", "pets_allowed", "aircon", "security"],
    petsAllowed: true,
    incomeMultiple: 3,
    minCreditScore: 650,
    availableFrom: "2026-09-01T00:00:00.000Z",
    description:
      "A calm two-bedroom with morning light, a short walk from Katipunan Ave. Pet-friendly building with 24/7 security and covered parking.",
    photos: [],
    createdAt: "2026-07-20T02:00:00.000Z",
  },
  {
    id: "unit_2",
    propertyId: "prop_1",
    code: "GRD-4822",
    title: "Cozy studio, high floor",
    type: "studio",
    bedrooms: 0,
    bathrooms: 1,
    areaSqm: 28,
    rent: money(1650000),
    deposit: money(3300000),
    status: "vacant",
    amenities: ["aircon", "security", "elevator", "gym"],
    petsAllowed: false,
    incomeMultiple: 3,
    minCreditScore: 640,
    availableFrom: "2026-08-25T00:00:00.000Z",
    description:
      "Efficient high-floor studio with skyline views, building gym, and fast elevators. Ideal for a single professional.",
    photos: [],
    createdAt: "2026-07-22T02:00:00.000Z",
  },
  {
    id: "unit_3",
    propertyId: "prop_2",
    code: "SKY-1130",
    title: "1-bedroom loft in Legazpi Village",
    type: "1br",
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 40,
    rent: money(3500000),
    deposit: money(7000000),
    status: "vacant",
    amenities: ["parking", "in_unit_laundry", "aircon", "security", "pool"],
    petsAllowed: true,
    incomeMultiple: 3,
    minCreditScore: 660,
    availableFrom: "2026-09-15T00:00:00.000Z",
    description:
      "Double-height loft steps from Legazpi Sunday Market. In-unit laundry, pool access, and secure parking.",
    photos: [],
    createdAt: "2026-07-25T02:00:00.000Z",
  },
  {
    id: "unit_4",
    propertyId: "prop_2",
    code: "SKY-1131",
    title: "Spacious 3-bedroom family unit",
    type: "3br",
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 88,
    rent: money(6200000),
    deposit: money(12400000),
    status: "vacant",
    amenities: ["parking", "pets_allowed", "in_unit_laundry", "aircon", "security", "pool", "gym"],
    petsAllowed: true,
    incomeMultiple: 3,
    minCreditScore: 670,
    availableFrom: "2026-10-01T00:00:00.000Z",
    description:
      "Family-sized three-bedroom with two baths, in-unit laundry, and full amenity access. Two covered parking slots.",
    photos: [],
    createdAt: "2026-07-28T02:00:00.000Z",
  },
  {
    id: "unit_5",
    propertyId: "prop_1",
    code: "GRD-4830",
    title: "Garden-level 1-bedroom",
    type: "1br",
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 36,
    rent: money(2200000),
    deposit: money(4400000),
    status: "vacant",
    amenities: ["pets_allowed", "aircon", "security", "balcony"],
    petsAllowed: true,
    incomeMultiple: 3,
    minCreditScore: 640,
    availableFrom: "2026-09-05T00:00:00.000Z",
    description:
      "Ground-floor one-bedroom opening to a shared garden. Quiet, pet-friendly, with a private balcony.",
    photos: [],
    createdAt: "2026-08-01T02:00:00.000Z",
  },
  {
    id: "unit_6",
    propertyId: "prop_2",
    code: "SKY-1140",
    title: "Executive studio, fully furnished",
    type: "studio",
    bedrooms: 0,
    bathrooms: 1,
    areaSqm: 32,
    rent: money(2600000),
    deposit: money(5200000),
    status: "vacant",
    amenities: ["furnished", "aircon", "security", "elevator", "gym", "pool"],
    petsAllowed: false,
    incomeMultiple: 3,
    minCreditScore: 650,
    availableFrom: "2026-08-30T00:00:00.000Z",
    description:
      "Move-in-ready furnished studio with full amenities. Perfect for relocating professionals.",
    photos: [],
    createdAt: "2026-08-03T02:00:00.000Z",
  },
];

export const applicants: Applicant[] = [
  {
    id: "appl_maria",
    fullName: "Maria Santos",
    email: "maria@email.com",
    phone: "+63 917 000 0000",
    dateOfBirth: "1994-03-14T00:00:00.000Z",
    govIdRef: "REF-ID-8841",
    currentAddress: "Maginhawa St, Quezon City",
    employer: "Northlight Studio",
    position: "Product Designer",
    grossMonthlyIncome: money(9500000),
    createdAt: "2026-08-17T06:00:00.000Z",
  },
];

export const users: User[] = [
  {
    id: "user_pm",
    name: "Property Manager",
    email: "pm@rentaldepot.example",
    role: "manager",
    propertyIds: [],
    createdAt: "2026-01-04T02:00:00.000Z",
  },
];

export const applications: Application[] = [
  {
    id: "app_2041",
    reference: "APP-2041",
    unitId: "unit_1",
    primaryApplicantId: "appl_maria",
    status: "screening",
    desiredMoveIn: "2026-09-01T00:00:00.000Z",
    leaseTermMonths: 12,
    monthlyIncome: money(9500000),
    consentGivenAt: "2026-08-18T04:30:00.000Z",
    signatureName: "Maria Santos",
    feeStatus: "paid",
    rubric: {
      incomeStability: 90,
      creditHistory: 82,
      rentalHistory: 85,
      completeness: 100,
      overall: 87,
    },
    submittedAt: "2026-08-18T06:14:00.000Z",
    createdAt: "2026-08-17T06:10:00.000Z",
    updatedAt: "2026-08-18T06:14:00.000Z",
  },
];

export const parties: ApplicationParty[] = [
  {
    id: "party_1",
    applicationId: "app_2041",
    applicantId: "appl_maria",
    role: "primary",
    completed: true,
  },
];

export const documents: ApplicationDocument[] = [
  { id: "doc_1", applicationId: "app_2041", type: "gov_id", label: "Government ID", status: "verified", fileName: "gov-id.jpg", uploadedAt: "2026-08-18T05:40:00.000Z" },
  { id: "doc_2", applicationId: "app_2041", type: "payslip", label: "Payslip · Aug", status: "verified", fileName: "payslip-aug.pdf", uploadedAt: "2026-08-18T05:41:00.000Z" },
  { id: "doc_3", applicationId: "app_2041", type: "payslip", label: "Payslip · Jul", status: "verified", fileName: "payslip-jul.pdf", uploadedAt: "2026-08-18T05:41:00.000Z" },
  { id: "doc_4", applicationId: "app_2041", type: "bank_statement", label: "Bank statement", status: "verified", fileName: "bank.pdf", uploadedAt: "2026-08-18T05:42:00.000Z" },
];

export const references: Reference[] = [
  { id: "ref_1", applicationId: "app_2041", name: "Ana Reyes", relationship: "Former landlord", contact: "+63 918 111 2222", kind: "landlord" },
];

export const screeningResults: ScreeningResult[] = [
  {
    id: "scr_1",
    applicationId: "app_2041",
    creditScore: 724,
    creditOutcome: "pass",
    incomeToRent: 3.4,
    incomeOutcome: "pass",
    backgroundOutcome: "pass",
    evictionOutcome: "pass",
    providerRef: "SCR-EXT-55231",
    completedAt: "2026-08-18T07:00:00.000Z",
  },
];

export const decisions: Decision[] = [];
