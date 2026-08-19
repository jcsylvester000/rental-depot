"use client";

import type { UnitSummary } from "@/lib/types";
import { UnitCard } from "@/components/applicant/UnitCard";
import { LinkButton } from "@/components/ui/Button";
import { useSaved } from "@/lib/client/saved";

export function SavedListings({ units }: { units: UnitSummary[] }) {
  const { ids, ready } = useSaved();
  if (!ready) return <div className="empty-state">Loading…</div>;

  const saved = units.filter((u) => ids.includes(u.id));

  if (saved.length === 0) {
    return (
      <div className="card empty-state">
        <h3>No saved homes yet</h3>
        <p>Tap the heart on any listing to keep it here for later.</p>
        <LinkButton href="/listings" variant="primary" style={{ marginTop: 14 }}>Browse homes</LinkButton>
      </div>
    );
  }

  return (
    <div className="grid-3">
      {saved.map((u) => (
        <UnitCard key={u.id} unit={u} />
      ))}
    </div>
  );
}
