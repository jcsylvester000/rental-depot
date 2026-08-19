"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ApplicationTracking } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { StatusStamp } from "@/components/ui/Stamp";
import { Button, LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useSession } from "@/lib/client/session";

export function StatusIndex() {
  const { user, ready } = useSession();
  const router = useRouter();
  const [list, setList] = React.useState<ApplicationTracking[] | null>(null);
  const [lookup, setLookup] = React.useState("");
  const [isSample, setIsSample] = React.useState(false);

  React.useEffect(() => {
    if (!ready) return;
    const q = user ? `?email=${encodeURIComponent(user.email)}` : "";
    fetch(`/api/v1/applications${q}`)
      .then((r) => r.json())
      .then((j) => {
        if (!j.ok) return;
        if (user && j.data.length > 0) {
          setList(j.data);
          setIsSample(false);
        } else {
          // Not signed in, or no applications yet: show samples to explore.
          fetch(`/api/v1/applications`)
            .then((r) => r.json())
            .then((s) => {
              if (s.ok) {
                setList(s.data);
                setIsSample(true);
              }
            });
        }
      });
  }, [ready, user]);

  function go(e: React.FormEvent) {
    e.preventDefault();
    if (lookup.trim()) router.push(`/status/${encodeURIComponent(lookup.trim().toUpperCase())}`);
  }

  return (
    <div style={{ maxWidth: 720 }}>
      {/* lookup */}
      <form onSubmit={go} className="card" style={{ padding: 20, marginBottom: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input className="input" style={{ flex: "1 1 220px" }} value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="Enter a reference, e.g. APP-2041" />
        <Button type="submit" variant="primary"><Icon name="search" size={15} /> Track</Button>
      </form>

      {isSample && (
        <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          {user ? "You have no applications yet." : "Sign in to see your own applications."} Meanwhile, explore these sample applications to see each stage.
        </p>
      )}

      {list === null ? (
        <div className="empty-state">Loading…</div>
      ) : list.length === 0 ? (
        <div className="card empty-state">
          <h3>No applications yet</h3>
          <p>When you apply for a home it will appear here.</p>
          <LinkButton href="/listings" variant="primary" style={{ marginTop: 14 }}>Find a property</LinkButton>
        </div>
      ) : (
        list.map((t) => (
          <Link key={t.id} href={`/status/${t.reference}`} className="card track-card">
            <div className="tc-body">
              <div className="tc-ref">{t.reference}</div>
              <div className="tc-title">{t.unitTitle}</div>
              <div className="muted" style={{ fontSize: 13 }}>{formatMoney(t.rent)}/mo · {t.unitCode}</div>
              <div className="tc-alerts">
                {t.openRequests > 0 && <span className="pill" style={{ background: "var(--clay-l)", color: "var(--clay)", borderColor: "transparent" }}><Icon name="flag" size={12} /> {t.openRequests} action needed</span>}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <StatusStamp status={t.status} />
              <Icon name="arrowRight" size={16} />
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
