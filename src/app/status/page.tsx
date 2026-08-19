import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { LinkButton } from "@/components/ui/Button";
import { StatusStamp } from "@/components/ui/Stamp";
import { Icon } from "@/components/ui/Icon";
import { getStore } from "@/lib/data/store";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Track application — Rental Depot" };

// Phase 1: a preview of the tracking screen using the demo record.
// Full, personalised, interactive tracking is built in Phase 3.
export default async function StatusPage() {
  const store = await getStore();
  const app = await store.getApplicationByRef("APP-2041");

  return (
    <>
      <PublicHeader active="/status" />
      <div className="wrap" style={{ paddingBottom: 48 }}>
        <div style={{ paddingTop: 28, marginBottom: 20 }}>
          <span className="eyebrow">Track application</span>
          <h1 style={{ fontSize: 32, marginTop: 8 }}>Where your application stands</h1>
          <p className="muted" style={{ marginTop: 4, maxWidth: "56ch" }}>
            Once you submit an application you can follow every step here in plain language. Below is
            a preview using a sample application.
          </p>
        </div>

        {app && (
          <div className="card" style={{ padding: 26, maxWidth: 620 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div>
                <div className="mono muted" style={{ fontSize: 12 }}>{app.reference}</div>
                <h3 style={{ fontSize: 20, marginTop: 4 }}>{app.unit.title}</h3>
                <div className="muted" style={{ fontSize: 14, marginTop: 2 }}>{formatMoney(app.unit.rent)}/mo · {app.unit.code}</div>
              </div>
              <StatusStamp status={app.status} />
            </div>
            <div className="ledger" style={{ marginTop: 20, paddingTop: 4 }}>
              <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: 0 }}>
                Your application is with the property manager for screening. We'll let you know the
                moment there's an update or if anything else is needed from you.
              </p>
            </div>
          </div>
        )}

        <div style={{ marginTop: 28, display: "flex", gap: 10 }}>
          <LinkButton href="/listings" variant="primary"><Icon name="search" size={16} /> Find a home</LinkButton>
          <LinkButton href="/account/login" variant="ghost">Sign in to track yours</LinkButton>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
