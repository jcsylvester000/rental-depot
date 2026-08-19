import { type NextRequest } from "next/server";
import { ok, notFound, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";
import type { Unit } from "@/lib/types";

export const dynamic = "force-dynamic";

/** PATCH /api/v1/admin/units/:id — update availability or per-unit criteria. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await req.json()) as Partial<Unit>;
    const patch: Partial<Unit> = {};
    if (body.status) patch.status = body.status;
    if (body.incomeMultiple != null) patch.incomeMultiple = body.incomeMultiple;
    if (body.minCreditScore != null) patch.minCreditScore = body.minCreditScore;
    if (body.petsAllowed != null) patch.petsAllowed = body.petsAllowed;
    if (body.rent) patch.rent = body.rent;
    const store = await getStore();
    const unit = await store.updateUnit(id, patch);
    if (!unit) return notFound("Unit not found");
    return ok(unit);
  } catch {
    return serverError("Failed to update unit");
  }
}
