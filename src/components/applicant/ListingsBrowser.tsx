"use client";

import * as React from "react";
import type { UnitSummary, Amenity } from "@/lib/types";
import { AMENITIES } from "@/lib/types";
import { AMENITY_LABELS } from "@/lib/labels";
import {
  type ListingFilters,
  type ListingSort,
  EMPTY_FILTERS,
  filtersToQuery,
  applyFilters,
  activeFilterCount,
} from "@/lib/listing-filters";
import { UnitCard } from "@/components/applicant/UnitCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const BED_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Any", value: null },
  { label: "Studio", value: 0 },
  { label: "1+", value: 1 },
  { label: "2+", value: 2 },
  { label: "3+", value: 3 },
];

export function ListingsBrowser({
  units,
  initialFilters,
}: {
  units: UnitSummary[];
  initialFilters: ListingFilters;
}) {
  const [filters, setFilters] = React.useState<ListingFilters>(initialFilters);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const cities = React.useMemo(() => Array.from(new Set(units.map((u) => u.city))).sort(), [units]);

  // Persist to the URL without a navigation (shareable + browser back).
  React.useEffect(() => {
    const q = filtersToQuery(filters);
    const url = q ? `/listings?${q}` : "/listings";
    window.history.replaceState(window.history.state, "", url);
  }, [filters]);

  const update = <K extends keyof ListingFilters>(key: K, value: ListingFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const toggleAmenity = (a: Amenity) =>
    setFilters((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));

  const results = React.useMemo(() => applyFilters(units, filters), [units, filters]);
  const activeCount = activeFilterCount(filters);

  return (
    <div className="listings-layout">
      <aside className={`card filter-panel ${drawerOpen ? "open" : ""}`} aria-label="Filters">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span className="filter-title" style={{ margin: 0 }}>Filters</span>
          {activeCount > 0 && (
            <button className="btn btn-quiet btn-sm" onClick={() => setFilters(EMPTY_FILTERS)}>Clear all</button>
          )}
        </div>

        <div className="filter-group">
          <div className="filter-title">Location</div>
          <select className="select" value={filters.city} onChange={(e) => update("city", e.target.value)}>
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <div className="filter-title">Max rent (₱/mo)</div>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            placeholder="e.g. 30000"
            value={filters.maxRent ?? ""}
            onChange={(e) => update("maxRent", e.target.value ? Number(e.target.value) : null)}
          />
        </div>

        <div className="filter-group">
          <div className="filter-title">Bedrooms</div>
          <div className="chip-row">
            {BED_OPTIONS.map((b) => (
              <button
                key={b.label}
                className="chip-toggle"
                aria-pressed={filters.beds === b.value}
                onClick={() => update("beds", b.value)}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-title">Move-in by</div>
          <input className="input" type="date" value={filters.moveIn} onChange={(e) => update("moveIn", e.target.value)} />
        </div>

        <div className="filter-group">
          <label className="check-row">
            <input type="checkbox" checked={filters.pets} onChange={(e) => update("pets", e.target.checked)} />
            Pet-friendly only
          </label>
        </div>

        <div className="filter-group">
          <div className="filter-title">Amenities</div>
          {AMENITIES.filter((a) => a !== "pets_allowed").map((a) => (
            <label key={a} className="check-row">
              <input type="checkbox" checked={filters.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
              {AMENITY_LABELS[a]}
            </label>
          ))}
        </div>
      </aside>

      <div>
        <div className="results-head">
          <div className="results-count">
            <b>{results.length}</b> {results.length === 1 ? "home" : "homes"} available
            {activeCount > 0 && ` · ${activeCount} filter${activeCount === 1 ? "" : "s"} applied`}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Button
              variant="ghost"
              size="sm"
              className="filter-drawer-toggle"
              onClick={() => setDrawerOpen((o) => !o)}
            >
              <Icon name="settings" size={15} /> Filters{activeCount ? ` (${activeCount})` : ""}
            </Button>
            <select
              className="select"
              value={filters.sort}
              onChange={(e) => update("sort", e.target.value as ListingSort)}
              aria-label="Sort listings"
            >
              <option value="newest">Newest first</option>
              <option value="rent_asc">Price: low to high</option>
              <option value="rent_desc">Price: high to low</option>
            </select>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="card empty-state">
            <h3>No homes match those filters</h3>
            <p>Try widening your price range or clearing a filter.</p>
            <Button variant="ghost" onClick={() => setFilters(EMPTY_FILTERS)} style={{ marginTop: 12 }}>
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid-3">
            {results.map((u) => (
              <UnitCard key={u.id} unit={u} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
