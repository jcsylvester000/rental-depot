import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { SavedListings } from "@/components/applicant/SavedListings";
import { getStore } from "@/lib/data/store";

export const metadata = { title: "Saved homes — Rental Depot" };

export default async function SavedPage() {
  const store = await getStore();
  const units = await store.listUnits();

  return (
    <>
      <PublicHeader />
      <div className="wrap" style={{ paddingBottom: 48 }}>
        <div style={{ paddingTop: 28, marginBottom: 8 }}>
          <span className="eyebrow">Your account</span>
          <h1 style={{ fontSize: 32, marginTop: 8 }}>Saved homes</h1>
          <p className="muted" style={{ marginTop: 4 }}>Homes you've shortlisted. Compare and apply when you're ready.</p>
        </div>
        <SavedListings units={units} />
      </div>
      <PublicFooter />
    </>
  );
}
