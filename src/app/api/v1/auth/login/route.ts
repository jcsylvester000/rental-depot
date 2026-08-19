import { type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { ok, badRequest, fail, serverError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** POST /api/v1/auth/login — credential check for API/mobile clients.
 *  The web app signs in through Auth.js (/api/auth). This verifies against
 *  the same User table and returns the identity (no cookie is set). */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string };
    if (!email || !email.includes("@")) return badRequest("A valid email is required");
    if (!password) return badRequest("Password is required");

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return fail("invalid_credentials", "Those credentials didn't match", 401);
    }
    return ok({ user: { id: user.id, fullName: user.name, email: user.email, role: user.role } });
  } catch {
    return serverError("Login failed");
  }
}
