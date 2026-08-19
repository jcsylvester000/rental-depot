/* Neon smoke test: end-to-end commercial-property flow through the store. */
import { config } from "dotenv";
config({ path: ".env.local" });

import { getStore } from "../src/lib/data/store";

async function main() {
  const store = await getStore();
  console.log("store:", store.constructor?.name ?? "(anonymous)");

  // 1. Discovery: commercial units exist and are summarised with class fields.
  const units = await store.listUnits();
  const commercial = units.filter((u) => u.propertyClass === "commercial");
  console.log(`\nunits total: ${units.length} · commercial: ${commercial.length}`);
  for (const u of commercial) console.log(`  - ${u.code} ${u.type} · ${u.permittedUse ?? "(no permitted use)"} · ${u.areaSqm}m²`);
  if (!commercial.length) throw new Error("No commercial units found — seed did not apply");

  const target = commercial.find((u) => u.status === "vacant") ?? commercial[0];

  // 2. Application: submit a business application against a commercial unit.
  const created = await store.createApplication({
    unitId: target.id,
    applicant: { fullName: "Smoke Test Contact", email: `smoke+${target.code}@example.com`, phone: "+63 900 000 0000" },
    applicantType: "business",
    businessName: "Smoke Test Trading Co.",
    businessType: "Corporation",
    natureOfBusiness: "Retail / F&B",
    yearsOperating: 4,
    intendedUse: "Coffee shop with 24 seats and a small kitchen",
    employer: "Smoke Test Trading Co.",
    monthlyIncomeMinor: 45000000,
    leaseTermMonths: 36,
    consent: true,
    signatureName: "Smoke Test Contact",
    feePaid: true,
  });
  console.log(`\ncreated application: ${created.reference} · type=${created.applicantType} · business=${created.businessName}`);

  // 3. Detail: the business fields round-trip.
  const detail = await store.getApplicationByRef(created.reference);
  console.log("detail businessType:", detail?.businessType, "| intendedUse:", detail?.intendedUse, "| unit.propertyClass:", detail?.unit.propertyClass);
  if (detail?.applicantType !== "business") throw new Error("applicantType did not persist as business");
  if (detail?.unit.propertyClass !== "commercial") throw new Error("unit propertyClass not commercial on detail");

  // 4. Admin queue: the row carries propertyClass + applicantType.
  const queue = await store.listAdminQueue({});
  const row = queue.find((r) => r.reference === created.reference);
  console.log("\nqueue row:", row ? `${row.reference} propertyClass=${row.propertyClass} applicantType=${row.applicantType}` : "NOT FOUND");
  if (!row || row.propertyClass !== "commercial" || row.applicantType !== "business") throw new Error("queue row missing class/type");

  console.log("\n✅ Commercial flow smoke test passed on live store.");
}

main().catch((e) => { console.error("❌", e); process.exit(1); });
