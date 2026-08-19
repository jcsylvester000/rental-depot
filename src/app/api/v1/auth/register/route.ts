import { type NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/** POST /api/v1/auth/register — STUB (Phase 1).
 *  Validates shape and returns a mock session. Real account
 *  creation + hashing land in Phase 6. Contract targets mobile. */
export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password } = (await req.json()) as {
      fullName?: string;
      email?: string;
      password?: string;
    };
    if (!fullName?.trim()) return badRequest("Full name is required");
    if (!email || !email.includes("@")) return badRequest("A valid email is required");
    if (!password || password.length < 8) return badRequest("Password must be at least 8 characters");

    return ok(
      {
        user: { id: "appl_local", fullName, email, role: "applicant" as const },
        token: `mock.${Buffer.from(email).toString("base64url")}`,
        note: "Stubbed auth — real account creation arrives in Phase 6.",
      },
      undefined,
      { status: 201 },
    );
  } catch {
    return serverError("Registration failed");
  }
}
