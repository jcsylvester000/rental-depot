import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { BulkUploadPanel } from "@/components/BulkUploadPanel";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "List your properties — Rental Depot" };

export default function ListYourPropertyPage() {
  return (
    <>
      <PublicHeader />
      <div className="wrap" id="main" style={{ maxWidth: 820, paddingTop: 32, paddingBottom: 56 }}>
        <span className="eyebrow">For property owners</span>
        <h1 style={{ fontSize: "clamp(28px,4vw,40px)", marginTop: 8, marginBottom: 10 }}>List your properties in bulk</h1>
        <p className="muted" style={{ fontSize: 16, maxWidth: "60ch" }}>
          Have a portfolio to add? Upload a CSV and we&apos;ll create every listing at once — homes and commercial
          spaces alike. Submissions are reviewed by our team before they go live, so nothing publishes automatically.
        </p>

        <div className="card" style={{ padding: 22, margin: "22px 0" }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>How it works</h3>
          <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10, color: "var(--ink-soft)", fontSize: 14.5 }}>
            <li><b>Download the template</b> below — it has the exact columns and two worked examples (one residential, one commercial).</li>
            <li><b>Fill a row per unit.</b> Rents and deposits are in pesos; separate multiple amenities with a semicolon (e.g. <span className="mono">parking;aircon;security</span>).</li>
            <li><b>Upload the CSV.</b> We validate every row and tell you exactly which ones need fixing.</li>
            <li><b>We review and publish.</b> Approved listings appear on the site and start taking applications.</li>
          </ol>
        </div>

        <BulkUploadPanel endpoint="/api/v1/listings/submit" />

        <div className="trust-note" style={{ marginTop: 8 }}>
          <span className="tn-ic"><Icon name="shield" size={16} /></span>
          <div>Only lawful, listing-relevant details are collected. Nothing you submit is published until an operator reviews it.</div>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
