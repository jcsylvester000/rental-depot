import { type NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";
import { parseListingsCsv } from "@/lib/csv/listings";

export const dynamic = "force-dynamic";

const MAX_ROWS = 100;

/**
 * POST /api/v1/listings/submit — public owner-facing bulk submission from CSV.
 * Submissions are created UNPUBLISHED (published:false) and stay hidden from the
 * public site until an operator reviews and publishes them in Listings & units.
 */
export async function POST(req: NextRequest) {
  try {
    const { csv } = (await req.json()) as { csv?: string };
    if (!csv?.trim()) return badRequest("No CSV content provided.");
    const { rows, errors } = parseListingsCsv(csv);
    if (rows.length > MAX_ROWS) return badRequest(`Too many rows (${rows.length}). Limit is ${MAX_ROWS} per submission.`);
    if (rows.length === 0) return badRequest(errors[0]?.message ?? "No valid listings found in the file.", errors);
    const store = await getStore();
    const result = await store.bulkCreateUnits(rows, false);
    return ok({ ...result, errors: [...errors, ...result.errors], pendingReview: true });
  } catch {
    return serverError("Submission failed.");
  }
}
