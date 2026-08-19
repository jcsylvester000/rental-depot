import type { Config } from "@netlify/functions";

/**
 * Daily chat-retention cleanup. Calls the app's protected purge endpoint, which
 * hard-deletes chat messages in threads inactive for 15 days.
 *
 * Requires two env vars in Netlify: URL (set automatically by Netlify) and
 * CRON_SECRET (the same value the /api/v1/cron/purge-chats route checks).
 */
const handler = async () => {
  const base = process.env.URL ?? process.env.DEPLOY_PRIME_URL;
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) {
    return new Response("Missing URL or CRON_SECRET", { status: 500 });
  }
  const res = await fetch(`${base}/api/v1/cron/purge-chats`, {
    method: "POST",
    headers: { "x-cron-secret": secret },
  });
  const text = await res.text();
  console.log("[purge-chats]", res.status, text);
  return new Response(text, { status: res.status });
};

export default handler;

export const config: Config = {
  schedule: "@daily",
};
