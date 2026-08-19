import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuditView } from "@/components/admin/AuditView";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Audit & compliance — Rental Depot Operator" };

export default async function AuditPage() {
  const store = await getStore();
  const events = await store.getAuditLog();
  return (
    <AdminShell title="Audit & compliance" crumb="Manage">
      <AuditView events={events} />
    </AdminShell>
  );
}
