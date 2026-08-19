"use client";

import * as React from "react";
import Link from "next/link";
import type { AdminQueueRow } from "@/lib/types";
import { StatusStamp } from "@/components/ui/Stamp";
import { Icon } from "@/components/ui/Icon";

export function CompareView({ rows }: { rows: AdminQueueRow[] }) {
  const units = React.useMemo(() => Array.from(new Set(rows.map((r) => r.unitCode))).sort(), [rows]);
  const [unit, setUnit] = React.useState(units[0] ?? "");
  const [picked, setPicked] = React.useState<string[]>([]);

  const candidates = rows.filter((r) => r.unitCode === unit);
  const selected = candidates.filter((r) => picked.includes(r.id));

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 3 ? [...p, id] : p));
  }

  // Best-per-row highlighting (higher is better; fewer flags is better).
  const best = {
    income: Math.max(...selected.map((s) => s.incomeToRent ?? 0)),
    credit: Math.max(...selected.map((s) => s.creditScore ?? 0)),
    complete: Math.max(...selected.map((s) => s.completenessPct)),
    score: Math.max(...selected.map((s) => s.score ?? 0)),
  };

  return (
    <div>
      <div className="trust-note" style={{ marginBottom: 16 }}>
        <span className="tn-ic"><Icon name="shield" size={16} /></span>
        <div>Compare on lawful, decision-relevant criteria only — income-to-rent, credit tier, completeness, and flags. Protected attributes are deliberately excluded.</div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Unit</label>
        <select className="select" style={{ width: "auto" }} value={unit} onChange={(e) => { setUnit(e.target.value); setPicked([]); }}>
          {units.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <span className="muted" style={{ fontSize: 13 }}>Pick up to 3 applicants to compare.</span>
      </div>

      {/* candidate chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {candidates.map((c) => (
          <button key={c.id} className="chip-toggle" aria-pressed={picked.includes(c.id)} onClick={() => toggle(c.id)}>
            {c.applicantName} · {c.reference}
          </button>
        ))}
        {candidates.length === 0 && <span className="muted" style={{ fontSize: 14 }}>No applicants for this unit.</span>}
      </div>

      {selected.length >= 2 ? (
        <div className="compare-grid" style={{ gridTemplateColumns: `160px repeat(${selected.length}, 1fr)` }}>
          <div className="compare-row head" style={{ gridTemplateColumns: `160px repeat(${selected.length}, 1fr)` }}>
            <div>Criterion</div>
            {selected.map((s) => <div key={s.id}>{s.applicantName}</div>)}
          </div>
          <Row label="Status" cols={selected} render={(s) => <StatusStamp status={s.status} />} gridCols={selected.length} />
          <Row label="Income-to-rent" cols={selected} bestVal={best.income} val={(s) => s.incomeToRent ?? 0} render={(s) => (s.incomeToRent ? `${s.incomeToRent}×` : "—")} gridCols={selected.length} />
          <Row label="Credit score" cols={selected} bestVal={best.credit} val={(s) => s.creditScore ?? 0} render={(s) => s.creditScore ?? "—"} gridCols={selected.length} />
          <Row label="Completeness" cols={selected} bestVal={best.complete} val={(s) => s.completenessPct} render={(s) => `${s.completenessPct}%`} gridCols={selected.length} />
          <Row label="Overall score" cols={selected} bestVal={best.score} val={(s) => s.score ?? 0} render={(s) => s.score ?? "—"} gridCols={selected.length} />
          <Row label="Flags" cols={selected} render={(s) => s.flags.length ? s.flags.join(", ") : "None"} gridCols={selected.length} />
          <div className="compare-row" style={{ gridTemplateColumns: `160px repeat(${selected.length}, 1fr)` }}>
            <div>Review</div>
            {selected.map((s) => <div key={s.id}><Link href={`/admin/applicant/${s.reference}`} className="link">Open →</Link></div>)}
          </div>
        </div>
      ) : (
        <div className="card empty-state"><h3>Select at least two applicants</h3><p>Pick from the same unit to compare them side by side.</p></div>
      )}
    </div>
  );
}

function Row({ label, cols, render, val, bestVal, gridCols }: {
  label: string; cols: AdminQueueRow[]; render: (s: AdminQueueRow) => React.ReactNode;
  val?: (s: AdminQueueRow) => number; bestVal?: number; gridCols: number;
}) {
  return (
    <div className="compare-row" style={{ gridTemplateColumns: `160px repeat(${gridCols}, 1fr)` }}>
      <div>{label}</div>
      {cols.map((s) => {
        const isBest = val && bestVal != null && bestVal > 0 && val(s) === bestVal;
        return <div key={s.id} className={isBest ? "best" : ""}>{render(s)}</div>;
      })}
    </div>
  );
}
