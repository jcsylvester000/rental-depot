import { type NextRequest } from "next/server";
import { ok, badRequest, notFound, serverError } from "@/lib/api/response";
import { getStore, type DecisionInput } from "@/lib/data/store";
import { DECISION_OUTCOMES, type DecisionOutcome } from "@/lib/types";

export const dynamic = "force-dynamic";

/** POST /api/v1/admin/applications/:ref/decision — record a decision (+ adverse action). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const { ref } = await params;
    const body = (await req.json()) as Partial<DecisionInput>;
    if (!body.outcome || !(DECISION_OUTCOMES as readonly string[]).includes(body.outcome)) {
      return badRequest("A valid outcome is required (approve | conditional | decline)");
    }
    if (!body.reasonCode) return badRequest("A reason code is required for a defensible decision");

    const store = await getStore();
    const decision = await store.decide(decodeURIComponent(ref), {
      outcome: body.outcome as DecisionOutcome,
      reasonCode: body.reasonCode,
      reasonText: body.reasonText,
      byUserId: body.byUserId,
    });
    if (!decision) return notFound("Application not found");
    return ok(decision);
  } catch {
    return serverError("Failed to record decision");
  }
}
