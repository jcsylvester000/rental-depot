/* ============================================================
 * RENTAL DEPOT — Mock DataStore implementation
 * Implements the DataStore contract against in-memory seed data.
 * Swapped for a Prisma-backed store in Phase 6 (same interface).
 *
 * Note: per the normalized contract, city/region live on Property,
 * not Unit. We enrich reads from Property at read time.
 * ============================================================ */

import type { DataStore, UnitListFilter, ApplicationListFilter } from "@/lib/data/store";
import type { Unit, UnitSummary, Application, ApplicationDetail } from "@/lib/types";
import {
  units,
  properties,
  applications,
  applicants,
  parties,
  documents,
  references,
  screeningResults,
  decisions,
} from "@/lib/mock/seed";

function locationOf(u: Unit): { city: string; region: string } {
  const p = properties.find((x) => x.id === u.propertyId);
  return { city: p?.city ?? "", region: p?.region ?? "" };
}

function toSummary(u: Unit): UnitSummary {
  const { city, region } = locationOf(u);
  return {
    id: u.id,
    code: u.code,
    title: u.title,
    city,
    region,
    bedrooms: u.bedrooms,
    bathrooms: u.bathrooms,
    areaSqm: u.areaSqm,
    rent: u.rent,
    status: u.status,
    petsAllowed: u.petsAllowed,
    amenities: u.amenities,
    coverPhoto: u.photos[0],
    availableFrom: u.availableFrom,
  };
}

export const mockStore: DataStore = {
  async listUnits(filter?: UnitListFilter): Promise<UnitSummary[]> {
    let list = [...units];

    if (filter) {
      if (filter.city) {
        const c = filter.city.toLowerCase();
        list = list.filter((u) => locationOf(u).city.toLowerCase().includes(c));
      }
      if (filter.bedrooms != null) list = list.filter((u) => u.bedrooms >= filter.bedrooms!);
      if (filter.petsAllowed != null) list = list.filter((u) => u.petsAllowed === filter.petsAllowed);
      if (filter.status) list = list.filter((u) => u.status === filter.status);
      if (filter.minRentMinor != null) list = list.filter((u) => u.rent.amountMinor >= filter.minRentMinor!);
      if (filter.maxRentMinor != null) list = list.filter((u) => u.rent.amountMinor <= filter.maxRentMinor!);
      if (filter.amenities?.length) list = list.filter((u) => filter.amenities!.every((a) => u.amenities.includes(a)));

      if (filter.sort === "rent_asc") list.sort((a, b) => a.rent.amountMinor - b.rent.amountMinor);
      else if (filter.sort === "rent_desc") list.sort((a, b) => b.rent.amountMinor - a.rent.amountMinor);
      else list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }

    return list.map(toSummary);
  },

  async getUnit(id: string): Promise<Unit | null> {
    return units.find((u) => u.id === id) ?? null;
  },

  async listApplications(filter?: ApplicationListFilter): Promise<Application[]> {
    let list = [...applications];
    if (filter?.status) list = list.filter((a) => a.status === filter.status);
    if (filter?.unitId) list = list.filter((a) => a.unitId === filter.unitId);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((a) => {
        const applicant = applicants.find((p) => p.id === a.primaryApplicantId);
        return (
          a.reference.toLowerCase().includes(q) ||
          (applicant?.fullName.toLowerCase().includes(q) ?? false) ||
          (applicant?.email.toLowerCase().includes(q) ?? false)
        );
      });
    }
    if (filter?.sort === "oldest") list.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
    else list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return list;
  },

  async getApplicationByRef(reference: string): Promise<ApplicationDetail | null> {
    const app = applications.find((a) => a.reference === reference);
    return app ? this.getApplication(app.id) : null;
  },

  async getApplication(id: string): Promise<ApplicationDetail | null> {
    const app = applications.find((a) => a.id === id);
    if (!app) return null;
    const applicant = applicants.find((p) => p.id === app.primaryApplicantId)!;
    const unit = units.find((u) => u.id === app.unitId)!;
    return {
      ...app,
      applicant,
      unit,
      parties: parties.filter((p) => p.applicationId === app.id),
      documents: documents.filter((d) => d.applicationId === app.id),
      references: references.filter((r) => r.applicationId === app.id),
      screening: screeningResults.find((s) => s.applicationId === app.id),
      decision: decisions.find((d) => d.applicationId === app.id),
    };
  },
};
