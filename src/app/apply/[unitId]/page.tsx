import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ApplyWizard } from "@/components/applicant/ApplyWizard";
import { getStore } from "@/lib/data/store";

export async function generateMetadata({ params }: { params: Promise<{ unitId: string }> }): Promise<Metadata> {
  const { unitId } = await params;
  const store = await getStore();
  const unit = await store.getUnit(unitId);
  return { title: unit ? `Apply — ${unit.title} — Rental Depot` : "Apply — Rental Depot" };
}

export default async function ApplyPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  const store = await getStore();
  const unit = await store.getUnit(unitId);
  if (!unit) notFound();

  const property = await store.getProperty(unit.propertyId);
  const location = property ? `${property.addressLine}, ${property.city}` : "";

  return (
    <>
      <PublicHeader />
      <ApplyWizard unit={unit} location={location} />
    </>
  );
}
