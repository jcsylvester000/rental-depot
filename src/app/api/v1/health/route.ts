import { ok } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/** GET /api/v1/health — liveness + API version marker. */
export async function GET() {
  return ok({
    service: "rental-depot-api",
    version: "v1",
    status: "up",
    dataSource: process.env.DATABASE_URL ? "prisma-neon" : "mock",
  });
}
