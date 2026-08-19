import { type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { ok, badRequest, fail, serverError } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** POST /api/v1/auth/register — create an applicant account (hashed password). */
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

    const normalized = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) return fail("email_taken", "An account with this email already exists", 409);

    const passwordHash = await bcrypt.hash(password, 10);
    const count = await prisma.user.count();
    const user = await prisma.user.create({
      data: { id: `user_${count + 1}_${Date.now()}`, name: fullName.trim(), email: normalized, role: "applicant", propertyIds: [], passwordHash },
    });

    return ok({ id: user.id, name: user.name, email: user.email, role: user.role }, undefined, { status: 201 });
  } catch {
    return serverError("Registration failed");
  }
}
