import { ok, notFound, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** POST /api/v1/admin/applications/:ref/screening — run/re-run screening. */
export async function POST(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const { ref } = await params;
    const store = await getStore();
    const result = await store.rerunScreening(decodeURIComponent(ref));
    if (!result) return notFound("Application not found");
    return ok(result);
  } catch {
    return serverError("Failed to run screening");
  }
}
