import { type NextRequest } from "next/server";
import { ok, notFound, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** POST /api/v1/applications/:ref/lease — applicant signs the lease (optionally pays deposit). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const { ref } = await params;
    const { payDeposit } = (await req.json().catch(() => ({}))) as { payDeposit?: boolean };
    const store = await getStore();
    const lease = await store.signLease(decodeURIComponent(ref), payDeposit);
    if (!lease) return notFound("Lease not found");
    return ok(lease);
  } catch {
    return serverError("Failed to sign lease");
  }
}
