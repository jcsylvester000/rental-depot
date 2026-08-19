import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { MessagesCenter } from "@/components/admin/MessagesCenter";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Messages — Rental Depot Operator" };

export default async function MessagesPage() {
  const store = await getStore();
  const [rows, settings] = await Promise.all([store.listAdminQueue(), store.getSettings()]);
  return (
    <AdminShell title="Messages" crumb="Manage">
      <MessagesCenter rows={rows} templates={settings.templates} />
    </AdminShell>
  );
}
