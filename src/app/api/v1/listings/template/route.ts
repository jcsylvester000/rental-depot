import { LISTING_CSV_TEMPLATE } from "@/lib/csv/listings";

export const dynamic = "force-static";

/** GET /api/v1/listings/template — download the bulk-upload CSV template. Public. */
export async function GET() {
  return new Response(LISTING_CSV_TEMPLATE, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="rental-depot-listings-template.csv"',
    },
  });
}
