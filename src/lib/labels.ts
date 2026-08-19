import type { Amenity, UnitType, UnitStatus, ApplicationStatus, PropertyClass, ApplicantType } from "@/lib/types";

export const AMENITY_LABELS: Record<Amenity, string> = {
  parking: "Parking",
  pets_allowed: "Pets allowed",
  in_unit_laundry: "In-unit laundry",
  elevator: "Elevator",
  security: "24/7 security",
  furnished: "Furnished",
  aircon: "Air-conditioning",
  balcony: "Balcony",
  gym: "Gym",
  pool: "Pool",
};

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  studio: "Studio",
  "1br": "1 Bedroom",
  "2br": "2 Bedroom",
  "3br": "3 Bedroom",
  "4br_plus": "4+ Bedroom",
  commercial: "Commercial",
  office: "Office",
  retail: "Retail",
  warehouse: "Warehouse",
};

export const PROPERTY_CLASS_LABELS: Record<PropertyClass, string> = {
  residential: "Residential",
  commercial: "Commercial",
};

export const APPLICANT_TYPE_LABELS: Record<ApplicantType, string> = {
  individual: "Individual",
  business: "Business",
};

export const UNIT_STATUS_LABELS: Record<UnitStatus, string> = {
  vacant: "Vacant",
  pending: "Pending",
  occupied: "Occupied",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "Received",
  incomplete: "Action needed",
  screening: "Screening",
  complete: "Under review",
  approved: "Approved",
  conditional: "Conditional",
  declined: "Declined",
};

export function bedroomsLabel(bedrooms: number): string {
  return bedrooms === 0 ? "Studio" : `${bedrooms} bed`;
}
