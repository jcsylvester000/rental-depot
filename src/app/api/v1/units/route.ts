import { type NextRequest } from "next/server";
import { ok, serverError } from "@/lib/api/response";
import { getStore, type UnitListFilter } from "@/lib/data/store";
import { AMENITIES, type Amenity, UNIT_STATUSES, type UnitStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

/** GET /api/v1/units — list listings with optional filters.
 *  Query: city, minRent, maxRent (major units), bedrooms, pets, amenities (csv), status, sort */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const filter: UnitListFilter = {};

    if (sp.get("city")) filter.city = sp.get("city")!;
    if (sp.get("bedrooms")) filter.bedrooms = Number(sp.get("bedrooms"));
    if (sp.get("pets")) filter.petsAllowed = sp.get("pets") === "true";
    if (sp.get("minRent")) filter.minRentMinor = Number(sp.get("minRent")) * 100;
    if (sp.get("maxRent")) filter.maxRentMinor = Number(sp.get("maxRent")) * 100;

    const status = sp.get("status");
    if (status && (UNIT_STATUSES as readonly string[]).includes(status)) {
      filter.status = status as UnitStatus;
    }

    const amenitiesRaw = sp.get("amenities");
    if (amenitiesRaw) {
      filter.amenities = amenitiesRaw
        .split(",")
        .filter((a): a is Amenity => (AMENITIES as readonly string[]).includes(a));
    }

    const sort = sp.get("sort");
    if (sort === "rent_asc" || sort === "rent_desc" || sort === "newest") {
      filter.sort = sort;
    }

    const store = await getStore();
    const units = await store.listUnits(filter);
    return ok(units, { total: units.length });
  } catch {
    return serverError("Failed to list units");
  }
}
