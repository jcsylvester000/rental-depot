import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { SettingsView } from "@/components/admin/SettingsView";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings & team — Rental Depot Operator" };

export default async function SettingsPage() {
  const store = await getStore();
  const [settings, users, properties] = await Promise.all([
    store.getSettings(),
    store.listUsers(),
    store.listProperties(),
  ]);
  return (
    <AdminShell title="Settings & team" crumb="Manage">
      <SettingsView settings={settings} users={users} properties={properties.map((p) => ({ id: p.id, name: p.name }))} />
    </AdminShell>
  );
}
