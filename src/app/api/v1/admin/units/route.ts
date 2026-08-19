import { type NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api/response";
import { getStore, type CreateUnitInput } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** POST /api/v1/admin/units — create a listing. */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CreateUnitInput>;
    if (!body.code || !body.title || !body.propertyId) return badRequest("code, title, and propertyId are required");
    const store = await getStore();
    const unit = await store.createUnit({
      propertyId: body.propertyId,
      code: body.code,
      title: body.title,
      type: body.type ?? "1br",
      propertyClass: body.propertyClass ?? "residential",
      permittedUse: body.permittedUse,
      bedrooms: body.bedrooms ?? 1,
      bathrooms: body.bathrooms ?? 1,
      areaSqm: body.areaSqm ?? 30,
      rentMinor: body.rentMinor ?? 0,
      depositMinor: body.depositMinor ?? 0,
      petsAllowed: body.petsAllowed ?? false,
      incomeMultiple: body.incomeMultiple ?? 3,
      availableFrom: body.availableFrom ?? new Date().toISOString(),
      description: body.description ?? "",
    });
    return ok(unit, undefined, { status: 201 });
  } catch {
    return serverError("Failed to create listing");
  }
}
