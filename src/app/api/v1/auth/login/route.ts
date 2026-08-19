import { type NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/** POST /api/v1/auth/login  — STUB (Phase 1).
 *  Validates shape and returns a mock session. Real credential
 *  verification + signed tokens land in Phase 6 (Auth.js). The
 *  request/response contract here is what the mobile app targets. */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string };
    if (!email || !email.includes("@")) return badRequest("A valid email is required");
    if (!password || password.length < 6) return badRequest("Password must be at least 6 characters");

    return ok({
      user: { id: "appl_local", fullName: email.split("@")[0], email, role: "applicant" as const },
      token: `mock.${Buffer.from(email).toString("base64url")}`,
      note: "Stubbed auth — real sessions arrive in Phase 6.",
    });
  } catch {
    return serverError("Login failed");
  }
}
