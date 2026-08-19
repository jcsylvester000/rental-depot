import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { StatusDetailView } from "@/components/applicant/StatusDetailView";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getStore } from "@/lib/data/store";

export async function generateMetadata({ params }: { params: Promise<{ ref: string }> }): Promise<Metadata> {
  const { ref } = await params;
  return { title: `${decodeURIComponent(ref)} — Track application — Rental Depot` };
}

export default async function StatusDetailPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const store = await getStore();
  const detail = await store.getApplicationByRef(decodeURIComponent(ref).toUpperCase());
  if (!detail) notFound();

  return (
    <>
      <PublicHeader active="/status" />
      <main id="main" className="wrap" style={{ paddingBottom: 48 }}>
        <div style={{ paddingTop: 20, marginBottom: 12 }}>
          <LinkButton href="/status" variant="quiet" size="sm">
            <Icon name="arrowLeft" size={15} /> All applications
          </LinkButton>
        </div>
        <StatusDetailView initial={detail} />
      </main>
      <PublicFooter />
    </>
  );
}
