import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { StatusIndex } from "@/components/applicant/StatusIndex";

export const metadata: Metadata = { title: "Track application — Rental Depot" };

export default function StatusPage() {
  return (
    <>
      <PublicHeader active="/status" />
      <main id="main" className="wrap" style={{ paddingBottom: 48 }}>
        <div style={{ paddingTop: 28, marginBottom: 20 }}>
          <span className="eyebrow">Track application</span>
          <h1 style={{ fontSize: 32, marginTop: 8 }}>Your applications</h1>
          <p className="muted" style={{ marginTop: 4, maxWidth: "56ch" }}>
            Follow every application in plain language, respond to requests, message the property
            manager, and sign your lease — all in one place.
          </p>
        </div>
        <StatusIndex />
      </main>
      <PublicFooter />
    </>
  );
}
