/* ============================================================
 * RENTAL DEPOT — DataStore interface (repository contract)
 * ------------------------------------------------------------
 * Route handlers depend ONLY on this interface. Phase 0 provides
 * a mock implementation; Phase 6 swaps in a Prisma-backed one
 * WITHOUT changing any route handler or the API surface.
 * ============================================================ */

import type {
  Application,
  ApplicationDetail,
  Unit,
  UnitSummary,
  UnitStatus,
  Amenity,
  ApplicationStatus,
} from "@/lib/types";

export interface UnitListFilter {
  city?: string;
  minRentMinor?: number;
  maxRentMinor?: number;
  bedrooms?: number;
  petsAllowed?: boolean;
  amenities?: Amenity[];
  status?: UnitStatus;
  availableFrom?: string;
  sort?: "newest" | "rent_asc" | "rent_desc";
}

export interface ApplicationListFilter {
  status?: ApplicationStatus;
  unitId?: string;
  search?: string;
  sort?: "newest" | "oldest" | "completeness" | "score";
}

export interface DataStore {
  // Discovery
  listUnits(filter?: UnitListFilter): Promise<UnitSummary[]>;
  getUnit(id: string): Promise<Unit | null>;

  // Applications
  listApplications(filter?: ApplicationListFilter): Promise<Application[]>;
  getApplicationByRef(reference: string): Promise<ApplicationDetail | null>;
  getApplication(id: string): Promise<ApplicationDetail | null>;
}

/**
 * Resolves the active DataStore. Today: the mock store.
 * Phase 6 flips this to the Prisma store behind the same call.
 */
let _store: DataStore | null = null;

export async function getStore(): Promise<DataStore> {
  if (_store) return _store;
  const { mockStore } = await import("@/lib/mock/store");
  _store = mockStore;
  return _store;
}
