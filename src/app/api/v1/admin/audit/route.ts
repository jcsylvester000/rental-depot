import { ok, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** GET /api/v1/admin/audit — derived append-only compliance log. */
export async function GET() {
  try {
    const store = await getStore();
    const events = await store.getAuditLog();
    return ok(events, { total: events.length });
  } catch {
    return serverError("Failed to load audit log");
  }
}
