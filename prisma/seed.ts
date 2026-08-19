/* Rental Depot — Neon seed. Run: npx tsx prisma/seed.ts
 * Idempotent: clears and re-inserts the reference dataset. */
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import ws from "ws";
import fs from "node:fs";

const OPERATOR_PW = bcrypt.hashSync("operator123", 10);
const APPLICANT_PW = bcrypt.hashSync("applicant123", 10);

if (typeof WebSocket === "undefined") neonConfig.webSocketConstructor = ws;

// Ensure DATABASE_URL is available even when run outside Next (reads .env.local).
if (!process.env.DATABASE_URL) {
  try {
    const env = fs.readFileSync(".env.local", "utf8");
    const m = env.match(/DATABASE_URL="([^"]+)"/);
    if (m) process.env.DATABASE_URL = m[1];
  } catch { /* ignore */ }
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const D = (s?: string) => (s ? new Date(s) : undefined);

// Unsplash placeholder imagery (stable CDN photo IDs). Swap for Cloudinary uploads later.
const px = (...ids: string[]) => ids.map((id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`);

async function main() {
  // Clear (reverse dependency order).
  await prisma.payment.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.documentRequest.deleteMany();
  await prisma.message.deleteMany();
  await prisma.operatorNote.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.screeningResult.deleteMany();
  await prisma.reference.deleteMany();
  await prisma.document.deleteMany();
  await prisma.applicationParty.deleteMany();
  await prisma.application.deleteMany();
  await prisma.applicant.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.property.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.user.deleteMany();
  await prisma.settings.deleteMany();

  await prisma.owner.create({ data: { id: "own_1", name: "Rental Depot Estates", contactEmail: "estates@rentaldepot.example", createdAt: D("2026-01-04T02:00:00.000Z")! } });

  await prisma.property.createMany({ data: [
    { id: "prop_1", ownerId: "own_1", name: "Katipunan Garden Residences", addressLine: "12 Katipunan Ave", city: "Quezon City", region: "Metro Manila", postcode: "1108", lat: 14.6396, lng: 121.0745, createdAt: D("2026-01-05T02:00:00.000Z")! },
    { id: "prop_2", ownerId: "own_1", name: "Makati Skyline Lofts", addressLine: "88 Legazpi St", city: "Makati", region: "Metro Manila", postcode: "1229", lat: 14.5547, lng: 121.0244, createdAt: D("2026-01-05T02:00:00.000Z")! },
  ] });

  await prisma.unit.createMany({ data: [
    { id: "unit_1", propertyId: "prop_1", code: "GRD-4821", title: "Bright 2-bedroom near Katipunan", type: "2br", bedrooms: 2, bathrooms: 1, areaSqm: 54, rentMinor: 2850000, depositMinor: 5700000, status: "pending", amenities: ["parking","pets_allowed","aircon","security"], petsAllowed: true, incomeMultiple: 3, minCreditScore: 650, availableFrom: D("2026-09-01T00:00:00.000Z")!, description: "A calm two-bedroom with morning light, a short walk from Katipunan Ave. Pet-friendly building with 24/7 security and covered parking.", photos: px("1560448204-e02f11c3d0e2", "1502672260266-1c1ef2d93688", "1493809842364-78817add7ffb"), createdAt: D("2026-07-20T02:00:00.000Z")! },
    { id: "unit_2", propertyId: "prop_1", code: "GRD-4822", title: "Cozy studio, high floor", type: "studio", bedrooms: 0, bathrooms: 1, areaSqm: 28, rentMinor: 1650000, depositMinor: 3300000, status: "vacant", amenities: ["aircon","security","elevator","gym"], petsAllowed: false, incomeMultiple: 3, minCreditScore: 640, availableFrom: D("2026-08-25T00:00:00.000Z")!, description: "Efficient high-floor studio with skyline views, building gym, and fast elevators. Ideal for a single professional.", photos: px("1522771739844-6a9f6d5f14af", "1554995207-c18c203602cb"), createdAt: D("2026-07-22T02:00:00.000Z")! },
    { id: "unit_3", propertyId: "prop_2", code: "SKY-1130", title: "1-bedroom loft in Legazpi Village", type: "1br", bedrooms: 1, bathrooms: 1, areaSqm: 40, rentMinor: 3500000, depositMinor: 7000000, status: "vacant", amenities: ["parking","in_unit_laundry","aircon","security","pool"], petsAllowed: true, incomeMultiple: 3, minCreditScore: 660, availableFrom: D("2026-09-15T00:00:00.000Z")!, description: "Double-height loft steps from Legazpi Sunday Market. In-unit laundry, pool access, and secure parking.", photos: px("1522708323590-d24dbb6b0267", "1493809842364-78817add7ffb", "1524758631624-e2822e304c36"), createdAt: D("2026-07-25T02:00:00.000Z")! },
    { id: "unit_4", propertyId: "prop_2", code: "SKY-1131", title: "Spacious 3-bedroom family unit", type: "3br", bedrooms: 3, bathrooms: 2, areaSqm: 88, rentMinor: 6200000, depositMinor: 12400000, status: "vacant", amenities: ["parking","pets_allowed","in_unit_laundry","aircon","security","pool","gym"], petsAllowed: true, incomeMultiple: 3, minCreditScore: 670, availableFrom: D("2026-10-01T00:00:00.000Z")!, description: "Family-sized three-bedroom with two baths, in-unit laundry, and full amenity access. Two covered parking slots.", photos: px("1600585154340-be6161a56a0c", "1560185007-cde436f6a4d0", "1522708323590-d24dbb6b0267"), createdAt: D("2026-07-28T02:00:00.000Z")! },
    { id: "unit_5", propertyId: "prop_1", code: "GRD-4830", title: "Garden-level 1-bedroom", type: "1br", bedrooms: 1, bathrooms: 1, areaSqm: 36, rentMinor: 2200000, depositMinor: 4400000, status: "vacant", amenities: ["pets_allowed","aircon","security","balcony"], petsAllowed: true, incomeMultiple: 3, minCreditScore: 640, availableFrom: D("2026-09-05T00:00:00.000Z")!, description: "Ground-floor one-bedroom opening to a shared garden. Quiet, pet-friendly, with a private balcony.", photos: px("1493809842364-78817add7ffb", "1449844908441-8829872d2607", "1560448204-e02f11c3d0e2"), createdAt: D("2026-08-01T02:00:00.000Z")! },
    { id: "unit_6", propertyId: "prop_2", code: "SKY-1140", title: "Executive studio, fully furnished", type: "studio", bedrooms: 0, bathrooms: 1, areaSqm: 32, rentMinor: 2600000, depositMinor: 5200000, status: "vacant", amenities: ["furnished","aircon","security","elevator","gym","pool"], petsAllowed: false, incomeMultiple: 3, minCreditScore: 650, availableFrom: D("2026-08-30T00:00:00.000Z")!, description: "Move-in-ready furnished studio with full amenities. Perfect for relocating professionals.", photos: px("1554995207-c18c203602cb", "1524758631624-e2822e304c36"), createdAt: D("2026-08-03T02:00:00.000Z")! },
    // Commercial units
    { id: "unit_7", propertyId: "prop_2", code: "SKY-C01", title: "Ground-floor retail space, Legazpi Village", type: "retail", propertyClass: "commercial", permittedUse: "Retail / F&B", bedrooms: 0, bathrooms: 1, areaSqm: 85, rentMinor: 8000000, depositMinor: 24000000, status: "vacant", amenities: ["parking","aircon","security"], petsAllowed: false, incomeMultiple: 3, availableFrom: D("2026-09-20T00:00:00.000Z")!, description: "High-visibility corner retail unit with wide frontage on a busy foot-traffic street. Suited to café, F&B, or boutique retail. Grease trap and heavy-power provisions available.", photos: px("1441986300917-64674bd600d8", "1604719312566-8912e9227c6a", "1567521464027-f127ff144326"), createdAt: D("2026-08-05T02:00:00.000Z")! },
    { id: "unit_8", propertyId: "prop_1", code: "GRD-C02", title: "Office suite near Katipunan", type: "office", propertyClass: "commercial", permittedUse: "Office / Professional services", bedrooms: 0, bathrooms: 1, areaSqm: 60, rentMinor: 5500000, depositMinor: 16500000, status: "vacant", amenities: ["parking","aircon","security","elevator"], petsAllowed: false, incomeMultiple: 3, availableFrom: D("2026-09-10T00:00:00.000Z")!, description: "Fitted office suite with meeting room and pantry, close to Katipunan transit. Ideal for a small firm or back-office team.", photos: px("1497366216548-37526070297c", "1497215728101-856f4ea42174", "1524758631624-e2822e304c36"), createdAt: D("2026-08-06T02:00:00.000Z")! },
  ] });

  await prisma.applicant.createMany({ data: [
    { id: "appl_maria", fullName: "Maria Santos", email: "maria@email.com", phone: "+63 917 000 0000", dateOfBirth: D("1994-03-14T00:00:00.000Z"), govIdRef: "REF-ID-8841", currentAddress: "Maginhawa St, Quezon City", employer: "Northlight Studio", position: "Product Designer", grossIncomeMinor: 9500000, grossIncomeCurrency: "PHP", createdAt: D("2026-08-17T06:00:00.000Z")! },
    { id: "appl_diego", fullName: "Diego Cruz", email: "diego@email.com", phone: "+63 917 222 3333", currentAddress: "Aurora Blvd, QC", employer: "Bright Labs", position: "Engineer", grossIncomeMinor: 12000000, grossIncomeCurrency: "PHP", createdAt: D("2026-08-14T02:00:00.000Z")! },
    { id: "appl_priya", fullName: "Priya Kumar", email: "priya@email.com", phone: "+63 917 444 5555", currentAddress: "Shaw Blvd, Mandaluyong", employer: "Freelance", position: "Consultant", grossIncomeMinor: 6000000, grossIncomeCurrency: "PHP", createdAt: D("2026-08-16T02:00:00.000Z")! },
    { id: "appl_carlos", fullName: "Carlos Tan", email: "carlos@brewco.example", phone: "+63 917 666 7777", currentAddress: "Makati", employer: "Brew & Co.", position: "Managing Director", grossIncomeMinor: 45000000, grossIncomeCurrency: "PHP", createdAt: D("2026-08-18T02:00:00.000Z")! },
  ] });

  await prisma.user.createMany({ data: [
    { id: "user_pm", name: "Property Manager", email: "pm@rentaldepot.example", role: "manager", propertyIds: [], passwordHash: OPERATOR_PW, createdAt: D("2026-01-04T02:00:00.000Z")! },
    { id: "user_agent", name: "Lea Fernandez", email: "lea@rentaldepot.example", role: "agent", propertyIds: ["prop_1"], passwordHash: OPERATOR_PW, createdAt: D("2026-02-01T02:00:00.000Z")! },
    { id: "user_admin", name: "Marco Diaz", email: "marco@rentaldepot.example", role: "admin", propertyIds: [], passwordHash: OPERATOR_PW, createdAt: D("2026-01-10T02:00:00.000Z")! },
    // Demo applicant login (matches the seeded Maria Santos applications).
    { id: "user_maria", name: "Maria Santos", email: "maria@email.com", role: "applicant", propertyIds: [], passwordHash: APPLICANT_PW, createdAt: D("2026-08-17T06:00:00.000Z")! },
  ] });

  await prisma.application.createMany({ data: [
    { id: "app_2041", reference: "APP-2041", unitId: "unit_1", primaryApplicantId: "appl_maria", status: "screening", desiredMoveIn: D("2026-09-01T00:00:00.000Z"), leaseTermMonths: 12, monthlyIncomeMinor: 9500000, monthlyIncomeCurrency: "PHP", consentGivenAt: D("2026-08-18T04:30:00.000Z"), signatureName: "Maria Santos", feeStatus: "paid", rubric: { incomeStability: 90, creditHistory: 82, rentalHistory: 85, completeness: 100, overall: 87 }, submittedAt: D("2026-08-18T06:14:00.000Z"), createdAt: D("2026-08-17T06:10:00.000Z")!, updatedAt: D("2026-08-18T06:14:00.000Z")! },
    { id: "app_2039", reference: "APP-2039", unitId: "unit_3", primaryApplicantId: "appl_diego", status: "approved", desiredMoveIn: D("2026-09-15T00:00:00.000Z"), leaseTermMonths: 12, monthlyIncomeMinor: 12000000, monthlyIncomeCurrency: "PHP", consentGivenAt: D("2026-08-14T05:00:00.000Z"), signatureName: "Diego Cruz", feeStatus: "paid", rubric: { incomeStability: 92, creditHistory: 88, rentalHistory: 80, completeness: 100, overall: 89 }, submittedAt: D("2026-08-14T06:00:00.000Z"), createdAt: D("2026-08-14T05:30:00.000Z")!, updatedAt: D("2026-08-18T02:00:00.000Z")! },
    { id: "app_2043", reference: "APP-2043", unitId: "unit_2", primaryApplicantId: "appl_priya", status: "incomplete", desiredMoveIn: D("2026-09-01T00:00:00.000Z"), leaseTermMonths: 12, monthlyIncomeMinor: 6000000, monthlyIncomeCurrency: "PHP", consentGivenAt: D("2026-08-16T05:00:00.000Z"), signatureName: "Priya Kumar", feeStatus: "paid", submittedAt: D("2026-08-16T06:00:00.000Z"), createdAt: D("2026-08-16T05:30:00.000Z")!, updatedAt: D("2026-08-17T02:00:00.000Z")! },
    // Commercial application
    { id: "app_2045", reference: "APP-2045", unitId: "unit_7", primaryApplicantId: "appl_carlos", status: "screening", applicantType: "business", businessName: "Brew & Co.", businessType: "Corporation", natureOfBusiness: "Specialty coffee shop / F&B", yearsOperating: 3, intendedUse: "Specialty coffee shop with a small kitchen", desiredMoveIn: D("2026-10-01T00:00:00.000Z"), leaseTermMonths: 36, monthlyIncomeMinor: 45000000, monthlyIncomeCurrency: "PHP", consentGivenAt: D("2026-08-18T05:00:00.000Z"), signatureName: "Carlos Tan", feeStatus: "paid", submittedAt: D("2026-08-18T06:00:00.000Z"), createdAt: D("2026-08-18T05:30:00.000Z")!, updatedAt: D("2026-08-18T06:00:00.000Z")! },
  ] });

  await prisma.applicationParty.createMany({ data: [
    { id: "party_1", applicationId: "app_2041", applicantId: "appl_maria", role: "primary", completed: true },
    { id: "party_2039", applicationId: "app_2039", applicantId: "appl_diego", role: "primary", completed: true },
    { id: "party_2043", applicationId: "app_2043", applicantId: "appl_priya", role: "primary", completed: true },
    { id: "party_2045", applicationId: "app_2045", applicantId: "appl_carlos", role: "primary", completed: true },
  ] });

  await prisma.document.createMany({ data: [
    { id: "doc_1", applicationId: "app_2041", type: "gov_id", label: "Government ID", status: "verified", fileName: "gov-id.jpg", uploadedAt: D("2026-08-18T05:40:00.000Z") },
    { id: "doc_2", applicationId: "app_2041", type: "payslip", label: "Payslip · Aug", status: "verified", fileName: "payslip-aug.pdf", uploadedAt: D("2026-08-18T05:41:00.000Z") },
    { id: "doc_3", applicationId: "app_2041", type: "payslip", label: "Payslip · Jul", status: "verified", fileName: "payslip-jul.pdf", uploadedAt: D("2026-08-18T05:41:00.000Z") },
    { id: "doc_4", applicationId: "app_2041", type: "bank_statement", label: "Bank statement", status: "verified", fileName: "bank.pdf", uploadedAt: D("2026-08-18T05:42:00.000Z") },
    { id: "doc_2039_1", applicationId: "app_2039", type: "gov_id", label: "Government ID", status: "verified", uploadedAt: D("2026-08-14T05:40:00.000Z") },
    { id: "doc_2039_2", applicationId: "app_2039", type: "payslip", label: "Payslip", status: "verified", uploadedAt: D("2026-08-14T05:41:00.000Z") },
    { id: "doc_2039_3", applicationId: "app_2039", type: "income_proof", label: "Bank statement", status: "verified", uploadedAt: D("2026-08-14T05:42:00.000Z") },
    { id: "doc_2043_1", applicationId: "app_2043", type: "gov_id", label: "Government ID", status: "verified", uploadedAt: D("2026-08-16T05:40:00.000Z") },
    { id: "doc_2045_1", applicationId: "app_2045", type: "gov_id", label: "Business registration (SEC)", status: "verified", uploadedAt: D("2026-08-18T05:40:00.000Z") },
    { id: "doc_2045_2", applicationId: "app_2045", type: "income_proof", label: "Financial statements (2 yrs)", status: "verified", uploadedAt: D("2026-08-18T05:41:00.000Z") },
    { id: "doc_2045_3", applicationId: "app_2045", type: "bank_statement", label: "Business bank statement", status: "verified", uploadedAt: D("2026-08-18T05:42:00.000Z") },
  ] });

  await prisma.reference.create({ data: { id: "ref_1", applicationId: "app_2041", name: "Ana Reyes", relationship: "Former landlord", contact: "+63 918 111 2222", kind: "landlord" } });

  await prisma.screeningResult.createMany({ data: [
    { id: "scr_1", applicationId: "app_2041", creditScore: 724, creditOutcome: "pass", incomeToRent: 3.4, incomeOutcome: "pass", backgroundOutcome: "pass", evictionOutcome: "pass", providerRef: "SCR-EXT-55231", completedAt: D("2026-08-18T07:00:00.000Z") },
    { id: "scr_2039", applicationId: "app_2039", creditScore: 760, creditOutcome: "pass", incomeToRent: 3.4, incomeOutcome: "pass", backgroundOutcome: "pass", evictionOutcome: "pass", providerRef: "SCR-EXT-55110", completedAt: D("2026-08-15T02:00:00.000Z") },
    { id: "scr_2045", applicationId: "app_2045", creditScore: 740, creditOutcome: "pass", incomeToRent: 5.6, incomeOutcome: "pass", backgroundOutcome: "pass", evictionOutcome: "pass", providerRef: "SCR-EXT-55302", completedAt: D("2026-08-18T07:00:00.000Z") },
  ] });

  await prisma.decision.create({ data: { id: "dec_2039", applicationId: "app_2039", outcome: "approve", reasonCode: "meets_criteria", reasonText: "Strong income and clean history.", decidedByUserId: "user_pm", adverseActionIssued: false, decidedAt: D("2026-08-18T02:00:00.000Z")! } });

  await prisma.message.createMany({ data: [
    { id: "msg_2041_1", applicationId: "app_2041", from: "system", body: "Application received. We'll confirm once screening completes.", createdAt: D("2026-08-18T06:15:00.000Z")! },
    { id: "msg_2041_2", applicationId: "app_2041", from: "operator", authorName: "Property Manager", body: "Thanks Maria — your documents look complete. Screening is underway.", createdAt: D("2026-08-18T08:00:00.000Z")! },
    { id: "msg_2043_1", applicationId: "app_2043", from: "operator", authorName: "Property Manager", body: "Hi Priya, we need one more document to proceed — please see the request below.", createdAt: D("2026-08-17T01:30:00.000Z")! },
    { id: "msg_2039_1", applicationId: "app_2039", from: "operator", authorName: "Property Manager", body: "Congratulations Diego! Your lease is ready to review and sign.", createdAt: D("2026-08-18T02:05:00.000Z")! },
  ] });

  await prisma.documentRequest.create({ data: { id: "req_2043_1", applicationId: "app_2043", docType: "payslip", label: "Recent payslip", reason: "We need your latest payslip to verify income.", status: "open", createdAt: D("2026-08-17T01:30:00.000Z")! } });

  await prisma.lease.create({ data: { id: "lease_2039", applicationId: "app_2039", unitId: "unit_3", termMonths: 12, rentMinor: 3500000, depositMinor: 7000000, startDate: D("2026-09-15T00:00:00.000Z")!, signedByApplicant: false, signedByOperator: true, createdAt: D("2026-08-18T02:05:00.000Z")! } });

  await prisma.payment.createMany({ data: [
    { id: "pay_2041_fee", type: "application_fee", status: "paid", amountMinor: 100000, applicationId: "app_2041", paidAt: D("2026-08-18T05:00:00.000Z"), createdAt: D("2026-08-18T05:00:00.000Z")! },
    { id: "pay_2039_fee", type: "application_fee", status: "paid", amountMinor: 100000, applicationId: "app_2039", paidAt: D("2026-08-14T05:00:00.000Z"), createdAt: D("2026-08-14T05:00:00.000Z")! },
    { id: "pay_2039_deposit", type: "deposit", status: "pending", amountMinor: 7000000, leaseId: "lease_2039", createdAt: D("2026-08-18T02:05:00.000Z")! },
  ] });

  await prisma.operatorNote.create({ data: { id: "note_2041_1", applicationId: "app_2041", authorName: "Property Manager", body: "Strong file — screening clean, income comfortably above threshold.", createdAt: D("2026-08-18T08:10:00.000Z")! } });

  await prisma.settings.create({ data: {
    id: "singleton",
    applicationFeeMinor: 100000,
    jurisdictionNote: "Fees are shown to applicants before payment. Where a jurisdiction caps or prohibits application fees, this amount is adjusted automatically.",
    screening: { incomeMultiple: 3, minCreditScore: 650, flagNotReject: true, requireConsentBeforeScreening: true },
    branding: { productName: "Rental Depot", accent: "#2F6E6A", applicantIntro: "Find a home, apply in minutes, know exactly where you stand." },
    templates: [
      { id: "tpl_ack", name: "Acknowledge receipt", body: "Thanks for applying — we've received your application and will be in touch soon." },
      { id: "tpl_docs", name: "Request documents", body: "To continue, please upload the following document(s): {items}." },
      { id: "tpl_approve", name: "Approval", body: "Great news — your application is approved! Your lease is ready to review and sign." },
    ],
    leaseClauses: "Standard residential lease. 12-month term, rent due on the 1st, security deposit equal to two months, maintenance and quiet-enjoyment clauses, 30-day notice for renewal.",
    integrations: [
      { key: "screening", name: "TenantCheck Screening", category: "screening", connected: true, detail: "Credit, criminal, eviction, income" },
      { key: "payments", name: "PayGate", category: "payments", connected: true, detail: "Fees, deposits, payouts" },
      { key: "esign", name: "SignFlow", category: "esign", connected: false, detail: "Lease e-signature routing" },
      { key: "portal", name: "ListingSync", category: "portal", connected: false, detail: "Push listings to external portals" },
    ],
  } });

  const counts = { units: await prisma.unit.count(), applications: await prisma.application.count(), messages: await prisma.message.count() };
  console.log("Seed complete:", counts);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
