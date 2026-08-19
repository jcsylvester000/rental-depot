import { type NextRequest } from "next/server";
import { ok, serverError } from "@/lib/api/response";
import { getStore, type AdminQueueFilter } from "@/lib/data/store";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

/** GET /api/v1/admin/queue — operator application queue with lawful filters. */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const filter: AdminQueueFilter = {};
    const status = sp.get("status");
    if (status && (APPLICATION_STATUSES as readonly string[]).includes(status)) filter.status = status as ApplicationStatus;
    if (sp.get("unitId")) filter.unitId = sp.get("unitId")!;
    if (sp.get("search")) filter.search = sp.get("search")!;
    if (sp.get("incomplete") === "true") filter.onlyIncomplete = true;
    const sort = sp.get("sort");
    if (sort === "oldest" || sort === "score" || sort === "completeness" || sort === "newest") filter.sort = sort;

    const store = await getStore();
    const rows = await store.listAdminQueue(filter);
    return ok(rows, { total: rows.length });
  } catch {
    return serverError("Failed to load queue");
  }
}
