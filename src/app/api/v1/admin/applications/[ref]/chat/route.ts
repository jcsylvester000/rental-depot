import { type NextRequest } from "next/server";
import { ok, badRequest, notFound, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** POST /api/v1/admin/applications/:ref/chat — operator accepts or declines a property chat request. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const { ref } = await params;
    const { action } = (await req.json()) as { action?: "accept" | "decline" };
    if (action !== "accept" && action !== "decline") return badRequest("action must be 'accept' or 'decline'");
    const store = await getStore();
    const app = action === "accept"
      ? await store.acceptChat(decodeURIComponent(ref), "operator")
      : await store.declineChat(decodeURIComponent(ref), "operator");
    if (!app) return notFound("Application not found");
    return ok({ chatStatus: app.chatStatus, chatInitiatedBy: app.chatInitiatedBy });
  } catch {
    return serverError("Failed to update chat request");
  }
}
