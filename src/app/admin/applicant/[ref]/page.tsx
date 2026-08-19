import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { ReviewWorkspace } from "@/components/admin/ReviewWorkspace";
import { getStore } from "@/lib/data/store";

export async function generateMetadata({ params }: { params: Promise<{ ref: string }> }): Promise<Metadata> {
  const { ref } = await params;
  return { title: `Review ${decodeURIComponent(ref)} — Rental Depot Operator` };
}

export default async function ReviewPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const store = await getStore();
  const detail = await store.getApplicationByRef(decodeURIComponent(ref).toUpperCase());
  if (!detail) notFound();

  return (
    <AdminShell title="Review applicant" crumb="Workspace · Applications">
      <ReviewWorkspace initial={detail} />
    </AdminShell>
  );
}
