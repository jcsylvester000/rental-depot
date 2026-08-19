import { type NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api/response";
import { getStore, type CreateApplicationInput } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** POST /api/v1/applications — submit an application. */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateApplicationInput;

    const errors: Record<string, string> = {};
    if (!body?.unitId) errors.unitId = "Unit is required";
    if (!body?.applicant?.fullName?.trim()) errors.fullName = "Full name is required";
    if (!body?.applicant?.email?.includes("@")) errors.email = "A valid email is required";
    if (!body?.applicant?.phone?.trim()) errors.phone = "Phone is required";
    if (!body?.consent) errors.consent = "Screening consent is required to submit";
    if (!body?.signatureName?.trim()) errors.signature = "Signature is required";

    if (Object.keys(errors).length) return badRequest("Please complete required fields", errors);

    const store = await getStore();
    const app = await store.createApplication(body);
    return ok(
      { id: app.id, reference: app.reference, status: app.status, submittedAt: app.submittedAt },
      undefined,
      { status: 201 },
    );
  } catch {
    return serverError("Could not submit application");
  }
}
