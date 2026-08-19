/** Stable date formatting (fixed locale + timezone) so server and client
 *  render identical strings — avoids React hydration mismatches. */

const TZ = "Asia/Manila";

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", timeZone: TZ });
}

export function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: TZ });
}
