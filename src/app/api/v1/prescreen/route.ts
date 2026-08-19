import { type NextRequest } from "next/server";
import { ok, badRequest, notFound, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";
import { formatMoney, money } from "@/lib/money";

export const dynamic = "force-dynamic";

export interface PreScreenRequest {
  unitId: string;
  monthlyIncome?: number; // major PHP units
  moveIn?: string; // yyyy-mm-dd
  occupants?: number;
  hasPets?: boolean;
}

export interface PreScreenResult {
  outcome: "eligible" | "review" | "requirements";
  summary: string;
  points: string[];
}

/** POST /api/v1/prescreen — soft eligibility guidance. Never a hard decision. */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PreScreenRequest;
    if (!body?.unitId) return badRequest("unitId is required");

    const store = await getStore();
    const unit = await store.getUnit(body.unitId);
    if (!unit) return notFound("Unit not found");

    const rentMajor = unit.rent.amountMinor / 100;
    const requiredIncomeMajor = rentMajor * unit.incomeMultiple;
    const points: string[] = [];
    let incomeOk = true;

    if (body.monthlyIncome != null) {
      incomeOk = body.monthlyIncome >= requiredIncomeMajor;
      points.push(
        incomeOk
          ? `Your income meets the ${unit.incomeMultiple}× guideline (${formatMoney(money(requiredIncomeMajor * 100))}+).`
          : `Most approvals here show income around ${formatMoney(money(requiredIncomeMajor * 100))}+ (${unit.incomeMultiple}× rent). A co-applicant or guarantor can help.`,
      );
    } else {
      points.push(`This home looks for gross income around ${formatMoney(money(requiredIncomeMajor * 100))}+ (${unit.incomeMultiple}× rent).`);
    }

    if (body.hasPets) {
      points.push(
        unit.petsAllowed
          ? "This unit is pet-friendly — you're good to bring your pet."
          : "Heads up: this specific unit isn't pet-friendly.",
      );
    }

    if (body.moveIn) {
      const available = new Date(unit.availableFrom);
      const wanted = new Date(body.moveIn);
      points.push(
        wanted >= available
          ? "Your move-in date works with this home's availability."
          : `This home is available from ${available.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}.`,
      );
    }

    const outcome: PreScreenResult["outcome"] = incomeOk ? "eligible" : "requirements";
    const summary = incomeOk
      ? "You appear eligible to apply."
      : "You can still apply — here's what usually strengthens an application.";

    return ok<PreScreenResult>({ outcome, summary, points });
  } catch {
    return serverError("Pre-screen failed");
  }
}
