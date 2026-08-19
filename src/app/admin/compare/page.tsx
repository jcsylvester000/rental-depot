import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { CompareView } from "@/components/admin/CompareView";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Compare applicants — Rental Depot Operator" };

export default async function ComparePage() {
  const store = await getStore();
  const rows = await store.listAdminQueue();
  return (
    <AdminShell title="Compare applicants" crumb="Workspace">
      <CompareView rows={rows} />
    </AdminShell>
  );
}
