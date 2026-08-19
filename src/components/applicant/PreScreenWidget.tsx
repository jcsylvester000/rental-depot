"use client";

import * as React from "react";
import type { PreScreenResult } from "@/app/api/v1/prescreen/route";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function PreScreenWidget({ unitId }: { unitId: string }) {
  const [income, setIncome] = React.useState("");
  const [moveIn, setMoveIn] = React.useState("");
  const [hasPets, setHasPets] = React.useState(false);
  const [result, setResult] = React.useState<PreScreenResult | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function check() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/prescreen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          monthlyIncome: income ? Number(income) : undefined,
          moveIn: moveIn || undefined,
          hasPets,
        }),
      });
      const body = await res.json();
      if (body.ok) setResult(body.data as PreScreenResult);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card prescreen">
      <h4>Quick eligibility check</h4>
      <p className="muted" style={{ fontSize: 13, margin: "0 0 14px" }}>
        A few questions — guidance only, not a decision.
      </p>
      <div className="field" style={{ marginBottom: 12 }}>
        <label>Gross monthly income (₱)</label>
        <input className="input" type="number" inputMode="numeric" placeholder="e.g. 95000" value={income} onChange={(e) => setIncome(e.target.value)} />
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label>Preferred move-in</label>
        <input className="input" type="date" value={moveIn} onChange={(e) => setMoveIn(e.target.value)} />
      </div>
      <label className="check-row" style={{ marginBottom: 14 }}>
        <input type="checkbox" checked={hasPets} onChange={(e) => setHasPets(e.target.checked)} /> I have a pet
      </label>
      <Button variant="accent" onClick={check} disabled={loading} style={{ width: "100%" }}>
        {loading ? "Checking…" : "Check eligibility"}
      </Button>

      {result && (
        <div className={`prescreen-result ${result.outcome === "eligible" ? "ok" : "warn"}`}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, marginBottom: 8 }}>
            <Icon name={result.outcome === "eligible" ? "check" : "flag"} size={16} />
            {result.summary}
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
            {result.points.map((p, i) => (
              <li key={i} style={{ fontSize: 13 }}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
