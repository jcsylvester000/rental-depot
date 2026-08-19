import { type NextRequest } from "next/server";
import { ok, badRequest, notFound, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** POST /api/v1/applications/:ref/documents — fulfill a document request (resubmission). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const { ref } = await params;
    const { requestId, assetRef, fileName } = (await req.json()) as { requestId?: string; assetRef?: string; fileName?: string };
    if (!requestId) return badRequest("requestId is required");
    const store = await getStore();
    const result = await store.fulfillDocumentRequest(decodeURIComponent(ref), requestId, { assetRef, fileName });
    if (!result) return notFound("Request not found");
    return ok(result);
  } catch {
    return serverError("Failed to submit document");
  }
}
