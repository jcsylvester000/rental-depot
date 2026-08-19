import { type NextRequest } from "next/server";
import { ok, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";
import type { AppSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

/** GET /api/v1/admin/settings */
export async function GET() {
  try {
    const store = await getStore();
    return ok(await store.getSettings());
  } catch {
    return serverError("Failed to load settings");
  }
}

/** PATCH /api/v1/admin/settings */
export async function PATCH(req: NextRequest) {
  try {
    const patch = (await req.json()) as Partial<AppSettings>;
    const store = await getStore();
    return ok(await store.updateSettings(patch));
  } catch {
    return serverError("Failed to update settings");
  }
}
