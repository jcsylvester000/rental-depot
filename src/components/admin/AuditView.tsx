"use client";

import * as React from "react";
import type { AuditEvent } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/lib/client/toast";

export function AuditView({ events }: { events: AuditEvent[] }) {
  const { toast } = useToast();
  const [entity, setEntity] = React.useState("");
  const entities = React.useMemo(() => Array.from(new Set(events.map((e) => e.entity))).sort(), [events]);
  const filtered = entity ? events.filter((e) => e.entity === entity) : events;

  function exportCsv() {
    const header = ["Time", "Actor", "Action", "Entity", "Reference", "Detail"];
    const lines = filtered.map((e) => [formatDateTime(e.createdAt), e.actor, e.action, e.entity, e.reference ?? "", e.detail ?? ""].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "rental-depot-audit-log.csv"; a.click();
    URL.revokeObjectURL(url);
    toast("Audit log exported");
  }

  const consentCount = events.filter((e) => e.entity === "Consent").length;

  return (
    <div>
      <div className="trust-note" style={{ marginBottom: 16 }}>
        <span className="tn-ic"><Icon name="shield" size={16} /></span>
        <div>An append-only record of submissions, consent, screening, decisions, and notices — so any decision can be reconstructed end to end. {consentCount} timestamped consent record(s) on file.</div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <select className="select" style={{ width: "auto" }} value={entity} onChange={(e) => setEntity(e.target.value)}>
          <option value="">All event types</option>
          {entities.map((en) => <option key={en} value={en}>{en}</option>)}
        </select>
        <span className="results-count"><b>{filtered.length}</b> events</span>
        <Button variant="ghost" size="sm" onClick={exportCsv} style={{ marginLeft: "auto" }}><Icon name="upload" size={15} /> Export evidence (CSV)</Button>
      </div>

      <div className="block">
        <table className="qtable">
          <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th><th>Reference</th><th>Detail</th></tr></thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id}>
                <td className="q-sub">{formatDateTime(e.createdAt)}</td>
                <td className="q-name">{e.actor}</td>
                <td>{e.action}</td>
                <td>{e.entity === "Consent" ? <span className="pill accent">{e.entity}</span> : <span className="muted">{e.entity}</span>}</td>
                <td className="mono" style={{ fontSize: 13 }}>{e.reference ?? "—"}</td>
                <td className="q-sub">{e.detail ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
