import { ok, notFound, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** GET /api/v1/units/:id — a single unit's full detail. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const store = await getStore();
    const unit = await store.getUnit(id);
    if (!unit) return notFound("Unit not found");
    return ok(unit);
  } catch {
    return serverError("Failed to load unit");
  }
}
