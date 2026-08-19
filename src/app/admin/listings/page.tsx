import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { ListingsManager } from "@/components/admin/ListingsManager";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Listings & units — Rental Depot Operator" };

export default async function ListingsAdminPage() {
  const store = await getStore();
  const [units, rows, properties] = await Promise.all([
    store.listUnitsAdmin(),
    store.listAdminQueue(),
    store.listProperties(),
  ]);

  return (
    <AdminShell title="Listings & units" crumb="Manage">
      <ListingsManager units={units} rows={rows} properties={properties.map((p) => ({ id: p.id, name: p.name }))} />
    </AdminShell>
  );
}
