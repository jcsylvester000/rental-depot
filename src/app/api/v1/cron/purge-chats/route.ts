import { type NextRequest } from "next/server";
import { ok, fail, serverError } from "@/lib/api/response";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

const RETENTION_DAYS = 15;

/**
 * POST /api/v1/cron/purge-chats — hard-delete chat messages in threads with no
 * activity for 15 days. Protected by CRON_SECRET; called by the daily Netlify
 * scheduled function (netlify/functions/purge-chats). Also safe to call manually.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get("x-cron-secret") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || provided !== secret) return fail("unauthorized", "Invalid or missing cron secret.", 401);
  try {
    const store = await getStore();
    const result = await store.purgeStaleChats(RETENTION_DAYS);
    return ok({ retentionDays: RETENTION_DAYS, ...result });
  } catch {
    return serverError("Purge failed.");
  }
}
