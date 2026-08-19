import { type NextRequest } from "next/server";
import { ok, badRequest, notFound, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** POST /api/v1/admin/applications/:ref/notes — add a private operator note. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const { ref } = await params;
    const { body, authorName } = (await req.json()) as { body?: string; authorName?: string };
    if (!body?.trim()) return badRequest("Note body is required");
    const store = await getStore();
    const note = await store.addNote(decodeURIComponent(ref), body, authorName);
    if (!note) return notFound("Application not found");
    return ok(note, undefined, { status: 201 });
  } catch {
    return serverError("Failed to add note");
  }
}
