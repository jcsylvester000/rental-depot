import { type NextRequest } from "next/server";
import { ok, badRequest, notFound, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** POST /api/v1/admin/applications/:ref/messages — operator replies to an applicant. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const { ref } = await params;
    const { body } = (await req.json()) as { body?: string };
    if (!body?.trim()) return badRequest("Message body is required");
    const store = await getStore();
    const msg = await store.addMessage(decodeURIComponent(ref), body, "operator");
    if (!msg) return notFound("Application not found");
    return ok(msg, undefined, { status: 201 });
  } catch {
    return serverError("Failed to send message");
  }
}
