/* ============================================================
 * Shared listing-filter logic — used by BOTH the server page
 * (for SSR'd initial results + SEO) and the client browser
 * (for interactive re-filtering). No client-only imports here.
 * ============================================================ */

import type { UnitSummary, Amenity } from "@/lib/types";
import { AMENITIES } from "@/lib/types";

export type ListingSort = "newest" | "rent_asc" | "rent_desc";

export interface ListingFilters {
  city: string;
  maxRent: number | null; // major units (₱)
  beds: number | null; // minimum bedrooms; 0 = studio; null = any
  pets: boolean;
  amenities: Amenity[];
  moveIn: string; // yyyy-mm-dd
  sort: ListingSort;
}

export const EMPTY_FILTERS: ListingFilters = {
  city: "",
  maxRent: null,
  beds: null,
  pets: false,
  amenities: [],
  moveIn: "",
  sort: "newest",
};

type ParamValue = string | string[] | undefined;

function first(v: ParamValue): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** Parse from Next's server searchParams record OR a URLSearchParams-derived record. */
export function parseFilters(params: Record<string, ParamValue>): ListingFilters {
  const amenities = (first(params.amenities) ?? "")
    .split(",")
    .filter((a): a is Amenity => (AMENITIES as readonly string[]).includes(a));
  const beds = first(params.beds);
  const sort = first(params.sort);
  return {
    city: first(params.city) ?? "",
    maxRent: first(params.maxRent) ? Number(first(params.maxRent)) : null,
    beds: beds !== undefined && beds !== "" ? Number(beds) : null,
    pets: first(params.pets) === "true",
    amenities,
    moveIn: first(params.moveIn) ?? "",
    sort: sort === "rent_asc" || sort === "rent_desc" ? sort : "newest",
  };
}

export function filtersToQuery(f: ListingFilters): string {
  const p = new URLSearchParams();
  if (f.city) p.set("city", f.city);
  if (f.maxRent) p.set("maxRent", String(f.maxRent));
  if (f.beds !== null) p.set("beds", String(f.beds));
  if (f.pets) p.set("pets", "true");
  if (f.amenities.length) p.set("amenities", f.amenities.join(","));
  if (f.moveIn) p.set("moveIn", f.moveIn);
  if (f.sort !== "newest") p.set("sort", f.sort);
  return p.toString();
}

export function applyFilters(units: UnitSummary[], f: ListingFilters): UnitSummary[] {
  let list = units.filter((u) => {
    if (f.city && u.city !== f.city) return false;
    if (f.maxRent && u.rent.amountMinor > f.maxRent * 100) return false;
    if (f.beds !== null) {
      if (f.beds === 0 ? u.bedrooms !== 0 : u.bedrooms < f.beds) return false;
    }
    if (f.pets && !u.petsAllowed) return false;
    if (f.amenities.length && !f.amenities.every((a) => u.amenities.includes(a))) return false;
    if (f.moveIn && new Date(u.availableFrom) > new Date(f.moveIn)) return false;
    return true;
  });
  if (f.sort === "rent_asc") list = [...list].sort((a, b) => a.rent.amountMinor - b.rent.amountMinor);
  else if (f.sort === "rent_desc") list = [...list].sort((a, b) => b.rent.amountMinor - a.rent.amountMinor);
  return list;
}

export function activeFilterCount(f: ListingFilters): number {
  return (
    (f.city ? 1 : 0) +
    (f.maxRent ? 1 : 0) +
    (f.beds !== null ? 1 : 0) +
    (f.pets ? 1 : 0) +
    f.amenities.length +
    (f.moveIn ? 1 : 0)
  );
}
