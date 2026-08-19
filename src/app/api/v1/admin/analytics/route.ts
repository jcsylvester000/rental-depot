import { type NextRequest } from "next/server";
import { ok, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** GET /api/v1/admin/analytics?property= — funnel, time-to-decision, status mix, vacancy. */
export async function GET(req: NextRequest) {
  try {
    const property = req.nextUrl.searchParams.get("property") ?? undefined;
    const store = await getStore();
    const data = await store.getAnalytics(property);
    return ok(data);
  } catch {
    return serverError("Failed to load analytics");
  }
}
