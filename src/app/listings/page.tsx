import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ListingsBrowser } from "@/components/applicant/ListingsBrowser";
import { getStore } from "@/lib/data/store";
import { parseFilters } from "@/lib/listing-filters";

export const metadata: Metadata = {
  title: "Find a home — Rental Depot",
  description: "Browse available units and filter by location, price, bedrooms, and amenities.",
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const store = await getStore();
  const units = await store.listUnits();
  const initialFilters = parseFilters(await searchParams);

  return (
    <>
      <PublicHeader active="/listings" />
      <div className="wrap" id="main">
        <div style={{ paddingTop: 28 }}>
          <span className="eyebrow">Find a home</span>
          <h1 style={{ fontSize: "clamp(28px,4vw,40px)", marginTop: 8 }}>Available homes</h1>
        </div>
        <ListingsBrowser units={units} initialFilters={initialFilters} />
      </div>
      <PublicFooter />
    </>
  );
}
