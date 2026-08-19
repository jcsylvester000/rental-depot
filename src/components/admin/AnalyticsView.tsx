"use client";

import * as React from "react";
import type { AnalyticsSummary, AdminQueueRow } from "@/lib/types";
import { APPLICATION_STATUS_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/lib/client/toast";

// Single-hue magnitude (per dataviz: color last, one hue for magnitude, labels never color-alone).
const HUE = "var(--verdigris)";

export function AnalyticsView({
  initial,
  properties,
  rows,
}: {
  initial: AnalyticsSummary;
  properties: { id: string; name: string }[];
  rows: AdminQueueRow[];
}) {
  const { toast } = useToast();
  const [data, setData] = React.useState(initial);
  const [property, setProperty] = React.useState("");
  const [range, setRange] = React.useState("30");

  async function onProperty(id: string) {
    setProperty(id);
    const r = await fetch(`/api/v1/admin/analytics${id ? `?property=${id}` : ""}`);
    const j = await r.json();
    if (j.ok) setData(j.data);
  }

  const { funnel, vacancy, byStatus, avgTimeToDecisionHours } = data;
  const maxStatus = Math.max(1, ...byStatus.map((s) => s.count));
  const occupancyPct = vacancy.total ? Math.round((vacancy.occupied / vacancy.total) * 100) : 0;
  const approvalRate = funnel.applications ? Math.round((funnel.approvals / funnel.applications) * 100) : 0;

  const funnelRows = [
    { label: "Listing views", value: funnel.views },
    { label: "Applications", value: funnel.applications },
    { label: "Approvals", value: funnel.approvals },
    { label: "Signed leases", value: funnel.leases },
  ];
  const maxFunnel = Math.max(1, ...funnelRows.map((f) => f.value));

  function exportCsv() {
    const header = ["Reference", "Applicant", "Email", "Unit", "Status", "Completeness%", "Score", "Submitted"];
    const lines = rows.map((r) => [r.reference, r.applicantName, r.applicantEmail, r.unitCode, r.status, r.completenessPct, r.score ?? "", formatDate(r.submittedAt)]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "rental-depot-applications.csv"; a.click();
    URL.revokeObjectURL(url);
    toast("Report exported (CSV)");
  }

  return (
    <div>
      {/* filters (one row above charts, per interaction guidance) */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
        <select className="select" style={{ width: "auto" }} value={property} onChange={(e) => onProperty(e.target.value)} aria-label="Property">
          <option value="">All properties</option>
          {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="select" style={{ width: "auto" }} value={range} onChange={(e) => setRange(e.target.value)} aria-label="Date range">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last quarter</option>
        </select>
        <Button variant="ghost" size="sm" onClick={exportCsv} style={{ marginLeft: "auto" }}><Icon name="upload" size={15} /> Export CSV</Button>
      </div>

      {/* stat tiles (headline numbers = not a chart, per choosing-a-form) */}
      <div className="stat-tiles">
        <div className="kpi"><div className="k-label">Avg. time to decision</div><div className="k-val">{avgTimeToDecisionHours}h</div><div className="k-trend">from submission to decision</div></div>
        <div className="kpi"><div className="k-label">Approval rate</div><div className="k-val">{approvalRate}%</div><div className="k-trend">of applications</div></div>
        <div className="kpi"><div className="k-label">Occupancy</div><div className="k-val">{occupancyPct}%</div><div className="k-trend">{vacancy.occupied}/{vacancy.total} units</div></div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* funnel — magnitude, single hue */}
        <div className="block">
          <div className="block-head"><h3>Conversion funnel</h3></div>
          <div className="block-body">
            <div className="funnel">
              {funnelRows.map((f, i) => {
                const conv = i === 0 ? null : Math.round((f.value / (funnelRows[i - 1].value || 1)) * 100);
                return (
                  <div key={f.label} className="funnel-row">
                    <div style={{ fontSize: 13, color: "var(--grey)" }}>{f.label}</div>
                    <div className="funnel-bar" style={{ width: `${Math.max(8, (f.value / maxFunnel) * 100)}%`, background: HUE }} title={`${f.label}: ${f.value}`}>{f.value}</div>
                    <div style={{ fontSize: 12, color: "var(--grey)", fontFamily: "var(--ff-mono)" }}>{conv != null ? `${conv}%` : ""}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* status mix — magnitude by state, single hue + text labels */}
        <div className="block">
          <div className="block-head"><h3>Applications by status</h3></div>
          <div className="block-body">
            <div className="bar-chart">
              {byStatus.map((s) => (
                <div key={s.status} className="bar-col">
                  <div className="bar-val">{s.count}</div>
                  <div className="bar" style={{ height: `${(s.count / maxStatus) * 100}%`, background: HUE }} title={`${APPLICATION_STATUS_LABELS[s.status]}: ${s.count}`} />
                  <div className="bar-label">{APPLICATION_STATUS_LABELS[s.status]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* vacancy */}
      <div className="block" style={{ marginTop: 20 }}>
        <div className="block-head"><h3>Vacancy & occupancy</h3></div>
        <div className="block-body">
          <div className="stat-tiles" style={{ marginBottom: 0 }}>
            <div className="screen-item"><div className="si-label">Vacant</div><div className="si-val">{vacancy.vacant}</div><div className="si-note">ready to fill</div></div>
            <div className="screen-item"><div className="si-label">Pending</div><div className="si-val">{vacancy.pending}</div><div className="si-note">application in progress</div></div>
            <div className="screen-item"><div className="si-label">Occupied</div><div className="si-val">{vacancy.occupied}</div><div className="si-note">leased</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
