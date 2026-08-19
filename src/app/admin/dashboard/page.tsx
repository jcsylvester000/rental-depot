import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { Icon } from "@/components/ui/Icon";
import { getStore } from "@/lib/data/store";
import { formatDateTime } from "@/lib/format";
import type { AdminQueueRow, ApplicationStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Dashboard — Rental Depot Operator" };

const BOARD: { key: string; label: string; statuses: ApplicationStatus[] }[] = [
  { key: "received", label: "Received", statuses: ["new", "incomplete"] },
  { key: "screening", label: "Screening", statuses: ["screening"] },
  { key: "review", label: "Review", statuses: ["complete"] },
  { key: "decided", label: "Decided", statuses: ["approved", "conditional", "declined"] },
];

export default async function DashboardPage() {
  const store = await getStore();
  const [rows, analytics] = await Promise.all([store.listAdminQueue(), store.getAnalytics()]);

  const newCount = rows.filter((r) => r.status === "new").length;
  const awaiting = rows.filter((r) => r.status === "screening" || r.status === "complete").length;
  const attention = rows.filter((r) => r.flags.length > 0);

  return (
    <AdminShell title="Good morning" crumb="Workspace">
      {/* KPIs */}
      <div className="kpi-row">
        <div className="kpi"><div className="k-label">New applications</div><div className="k-val">{newCount}</div><div className="k-trend"><Icon name="arrowUp" size={13} /> in the queue</div></div>
        <div className="kpi warn"><div className="k-label">Awaiting review</div><div className="k-val">{awaiting}</div><div className="k-trend">screening &amp; decision</div></div>
        <div className="kpi"><div className="k-label">Avg. time to decide</div><div className="k-val">{analytics.avgTimeToDecisionHours}h</div><div className="k-trend"><Icon name="arrowUp" size={13} /> within target</div></div>
        <div className="kpi alert"><div className="k-label">Vacant units</div><div className="k-val">{analytics.vacancy.vacant}</div><div className="k-trend down">of {analytics.vacancy.total} total</div></div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* pipeline */}
        <div className="block">
          <div className="block-head"><h3>Application pipeline</h3><Link className="link" href="/admin/queue">Open full queue →</Link></div>
          <div className="block-body">
            <div className="board">
              {BOARD.map((col) => {
                const items = rows.filter((r) => col.statuses.includes(r.status));
                return (
                  <div key={col.key} className="board-col">
                    <h4>{col.label}<span>{items.length}</span></h4>
                    {items.map((r) => (
                      <Link key={r.id} href={`/admin/applicant/${r.reference}`} className="board-card">
                        <div className="bc-name">{r.applicantName}</div>
                        <div className="bc-meta">{r.reference} · {r.unitCode}</div>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* attention + quick actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="block">
            <div className="block-head"><h3>Needs your attention</h3></div>
            <div className="block-body">
              {attention.length === 0 && <p className="muted" style={{ fontSize: 13, margin: 0 }}>Nothing needs attention right now.</p>}
              {attention.map((r) => (
                <Link key={r.id} href={`/admin/applicant/${r.reference}`} className="note-item" style={{ display: "block", background: r.flags.includes("eviction") ? "var(--clay-l)" : "var(--amber-l)" }}>
                  <div className="ni-head"><b>{r.applicantName}</b><span>{r.reference}</span></div>
                  {r.flags.includes("incomplete") ? "Incomplete — awaiting a document." : `Flagged: ${r.flags.join(", ")}.`}
                </Link>
              ))}
            </div>
          </div>
          <div className="block">
            <div className="block-head"><h3>Quick actions</h3></div>
            <div className="block-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/admin/queue" className="btn btn-primary" style={{ justifyContent: "flex-start" }}><Icon name="inbox" size={16} /> Review applications</Link>
              <Link href="/admin/compare" className="btn btn-ghost" style={{ justifyContent: "flex-start" }}><Icon name="scale" size={16} /> Compare applicants</Link>
              <Link href="/admin/analytics" className="btn btn-ghost" style={{ justifyContent: "flex-start" }}><Icon name="chart" size={16} /> View analytics</Link>
            </div>
          </div>
        </div>
      </div>

      {/* recent activity */}
      <div className="block" style={{ marginTop: 20 }}>
        <div className="block-head"><h3>Recent activity</h3></div>
        <div className="block-body">
          {recentActivity(rows).map((a, i) => (
            <div key={i} className="audit-row">
              <span className="ar-ic"><Icon name={a.icon} size={15} /></span>
              <div><span className="ar-actor">{a.actor}</span> {a.text}</div>
              <span className="ar-time" style={{ marginLeft: "auto" }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

function recentActivity(rows: AdminQueueRow[]) {
  return rows
    .filter((r) => r.submittedAt)
    .sort((a, b) => ((a.submittedAt ?? "") < (b.submittedAt ?? "") ? 1 : -1))
    .slice(0, 5)
    .map((r) => {
      const decided = r.status === "approved" || r.status === "conditional" || r.status === "declined";
      return {
        icon: decided ? "check" : "inbox",
        actor: decided ? "You" : r.applicantName,
        text: decided ? `${r.status} ${r.applicantName} (${r.reference})` : `submitted an application (${r.reference})`,
        time: formatDateTime(r.submittedAt),
      };
    });
}
