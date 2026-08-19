import { type NextRequest } from "next/server";
import { ok, badRequest, notFound, fail, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** POST /api/v1/applications/:ref/messages — applicant sends a message (gated by the chat invitation). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const { ref } = await params;
    const { body } = (await req.json()) as { body?: string };
    if (!body?.trim()) return badRequest("Message body is required");
    const store = await getStore();
    const result = await store.addMessage(decodeURIComponent(ref), body, "applicant");
    if (!result.ok) {
      if (result.code === "not_found") return notFound("Application not found");
      return fail(result.code, result.message, 409);
    }
    return ok({ message: result.message, chatStatus: result.chatStatus }, undefined, { status: 201 });
  } catch {
    return serverError("Failed to send message");
  }
}
