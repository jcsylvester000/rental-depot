import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AnalyticsView } from "@/components/admin/AnalyticsView";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Analytics — Rental Depot Operator" };

export default async function AnalyticsPage() {
  const store = await getStore();
  const [analytics, properties, rows] = await Promise.all([
    store.getAnalytics(),
    store.listProperties(),
    store.listAdminQueue(),
  ]);

  return (
    <AdminShell title="Analytics & reporting" crumb="Workspace">
      <AnalyticsView
        initial={analytics}
        properties={properties.map((p) => ({ id: p.id, name: p.name }))}
        rows={rows}
      />
    </AdminShell>
  );
}
