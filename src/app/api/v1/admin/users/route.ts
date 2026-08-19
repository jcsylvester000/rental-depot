import { type NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";
import { USER_ROLES, type UserRole } from "@/lib/types";

export const dynamic = "force-dynamic";

/** GET /api/v1/admin/users */
export async function GET() {
  try {
    const store = await getStore();
    return ok(await store.listUsers());
  } catch {
    return serverError("Failed to load team");
  }
}

/** POST /api/v1/admin/users — add a team member. */
export async function POST(req: NextRequest) {
  try {
    const { name, email, role, propertyIds } = (await req.json()) as { name?: string; email?: string; role?: string; propertyIds?: string[] };
    if (!name?.trim() || !email?.includes("@")) return badRequest("Name and a valid email are required");
    const r = role && (USER_ROLES as readonly string[]).includes(role) ? (role as UserRole) : "agent";
    const store = await getStore();
    const user = await store.addUser({ name, email, role: r, propertyIds });
    return ok(user, undefined, { status: 201 });
  } catch {
    return serverError("Failed to add team member");
  }
}
