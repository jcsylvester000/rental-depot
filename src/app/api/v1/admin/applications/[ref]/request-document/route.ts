import { type NextRequest } from "next/server";
import { ok, badRequest, notFound, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** POST /api/v1/admin/applications/:ref/request-document — ask the applicant for a document. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const { ref } = await params;
    const { docType, label, reason } = (await req.json()) as { docType?: string; label?: string; reason?: string };
    if (!label?.trim()) return badRequest("A document label is required");
    const store = await getStore();
    const request = await store.requestDocument(
      decodeURIComponent(ref),
      docType ?? "other",
      label,
      reason ?? "Please provide this document to continue.",
    );
    if (!request) return notFound("Application not found");
    return ok(request, undefined, { status: 201 });
  } catch {
    return serverError("Failed to request document");
  }
}
