import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { SaveButton } from "@/components/applicant/SaveButton";
import { PreScreenWidget } from "@/components/applicant/PreScreenWidget";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Stamp } from "@/components/ui/Stamp";
import { getStore } from "@/lib/data/store";
import { formatMoney } from "@/lib/money";
import { AMENITY_LABELS, UNIT_TYPE_LABELS, bedroomsLabel } from "@/lib/labels";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const store = await getStore();
  const unit = await store.getUnit(id);
  return { title: unit ? `${unit.title} — Rental Depot` : "Home — Rental Depot" };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await getStore();
  const unit = await store.getUnit(id);
  if (!unit) notFound();

  const property = await store.getProperty(unit.propertyId);
  const location = property ? `${property.city}, ${property.region}` : "";
  const availLabel = { vacant: "Vacant", pending: "Pending", occupied: "Occupied" }[unit.status];
  const availCls = { vacant: "approved", pending: "review", occupied: "declined" }[unit.status];
  const canApply = unit.status !== "occupied";

  return (
    <>
      <PublicHeader active="/listings" />
      <div className="wrap">
        <div style={{ paddingTop: 20 }}>
          <LinkButton href="/listings" variant="quiet" size="sm">
            <Icon name="arrowLeft" size={15} /> Back to listings
          </LinkButton>
        </div>

        <div className="detail-layout">
          {/* main */}
          <div>
            <div className="detail-gallery">
              <Icon name="building" size={64} />
              <span className="code mono pill">{unit.code}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div>
                <h1 className="detail-title">{unit.title}</h1>
                <div className="detail-sub">
                  {property && (
                    <span><Icon name="mapPin" size={15} style={{ display: "inline", verticalAlign: "-2px" }} /> {property.addressLine}, {location}</span>
                  )}
                  <span>{UNIT_TYPE_LABELS[unit.type]}</span>
                  <span>{unit.areaSqm} m²</span>
                </div>
              </div>
              <Stamp variant={availCls}>{availLabel}</Stamp>
            </div>

            <div className="detail-section">
              <h3 style={{ fontSize: 18, marginBottom: 10 }}>About this home</h3>
              <p style={{ color: "var(--ink-soft)", margin: 0 }}>{unit.description}</p>
            </div>

            <div className="detail-section">
              <h3 style={{ fontSize: 18, marginBottom: 14 }}>Amenities</h3>
              <div className="amenity-grid">
                {unit.amenities.map((a) => (
                  <div key={a} className="amenity">
                    <span className="a-ic"><Icon name="check" size={16} /></span>
                    {AMENITY_LABELS[a]}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card apply-card">
              <div className="apply-rent">
                {formatMoney(unit.rent)} <small>/month</small>
              </div>
              <div style={{ margin: "16px 0" }}>
                <div className="spec-row"><span>Deposit</span><b>{formatMoney(unit.deposit)}</b></div>
                <div className="spec-row"><span>Bedrooms</span><b>{bedroomsLabel(unit.bedrooms)}</b></div>
                <div className="spec-row"><span>Bathrooms</span><b>{unit.bathrooms}</b></div>
                <div className="spec-row"><span>Floor area</span><b>{unit.areaSqm} m²</b></div>
                <div className="spec-row"><span>Available from</span><b>{new Date(unit.availableFrom).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</b></div>
                <div className="spec-row"><span>Income guideline</span><b>{unit.incomeMultiple}× rent</b></div>
              </div>
              {canApply ? (
                <LinkButton href={`/apply/${unit.id}`} variant="primary" size="lg" style={{ width: "100%", marginBottom: 10 }}>
                  Apply for this home <Icon name="arrowRight" size={16} />
                </LinkButton>
              ) : (
                <button className="btn btn-primary btn-lg" style={{ width: "100%", marginBottom: 10 }} disabled>
                  Currently occupied
                </button>
              )}
              <SaveButton unitId={unit.id} variant="full" />
            </div>

            <PreScreenWidget unitId={unit.id} />
          </div>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
