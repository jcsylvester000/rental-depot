import { ok, notFound, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** GET /api/v1/applications/:ref — application detail by reference (e.g. APP-2041). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  try {
    const { ref } = await params;
    const store = await getStore();
    const app = await store.getApplicationByRef(decodeURIComponent(ref));
    if (!app) return notFound("Application not found");
    return ok(app);
  } catch {
    return serverError("Failed to load application");
  }
}
