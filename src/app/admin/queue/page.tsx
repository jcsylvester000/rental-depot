import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { QueueView } from "@/components/admin/QueueView";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Applications — Rental Depot Operator" };

export default async function QueuePage() {
  const store = await getStore();
  const [rows, units] = await Promise.all([store.listAdminQueue(), store.listUnits()]);

  return (
    <AdminShell title="Applications" crumb="Workspace">
      <QueueView rows={rows} units={units} />
    </AdminShell>
  );
}
