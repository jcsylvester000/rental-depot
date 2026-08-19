import Link from "next/link";
import type { UnitSummary } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { Stamp } from "@/components/ui/Stamp";
import { Icon } from "@/components/ui/Icon";

const AVAIL_STAMP: Record<string, { cls: string; label: string }> = {
  vacant: { cls: "approved", label: "Vacant" },
  pending: { cls: "review", label: "Pending" },
  occupied: { cls: "declined", label: "Occupied" },
};

export function UnitCard({ unit }: { unit: UnitSummary }) {
  const avail = AVAIL_STAMP[unit.status];
  const beds = unit.bedrooms === 0 ? "Studio" : `${unit.bedrooms} bed`;
  return (
    <Link href={`/listings/${unit.id}`} className="card unit-card" aria-label={unit.title}>
      <div className="unit-photo">
        <Icon name="building" size={40} />
        <span className="code mono pill">{unit.code}</span>
        <span className="avail">
          <Stamp variant={avail.cls}>{avail.label}</Stamp>
        </span>
      </div>
      <div className="unit-body">
        <div className="unit-rent">
          {formatMoney(unit.rent)} <small>/mo</small>
        </div>
        <div className="unit-title">{unit.title}</div>
        <div className="muted" style={{ fontSize: 13 }}>
          {unit.city}, {unit.region}
        </div>
        <div className="unit-meta">
          <span>{beds}</span>
          <span>{unit.bathrooms} bath</span>
          <span>{unit.areaSqm} m²</span>
          {unit.petsAllowed && <span>Pet-friendly</span>}
        </div>
      </div>
    </Link>
  );
}
