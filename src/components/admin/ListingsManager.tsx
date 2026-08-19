"use client";

import * as React from "react";
import type { Unit, UnitStatus, AdminQueueRow } from "@/lib/types";
import { UNIT_STATUSES } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { UNIT_STATUS_LABELS } from "@/lib/labels";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/lib/client/toast";

export function ListingsManager({
  units: initialUnits,
  rows,
  properties,
}: {
  units: Unit[];
  rows: AdminQueueRow[];
  properties: { id: string; name: string }[];
}) {
  const { toast } = useToast();
  const [units, setUnits] = React.useState(initialUnits);
  const [adding, setAdding] = React.useState(false);

  const appCount = (unitId: string) => rows.filter((r) => r.unitId === unitId).length;

  async function patch(id: string, body: Partial<Unit>) {
    const r = await fetch(`/api/v1/admin/units/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    if (j.ok) { setUnits((us) => us.map((u) => (u.id === id ? j.data : u))); toast("Listing updated"); }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>Set availability and per-unit screening criteria before a unit takes applications.</p>
        <Button variant="primary" size="sm" onClick={() => setAdding((a) => !a)}><Icon name="plus" size={15} /> Add listing</Button>
      </div>

      {adding && <AddListingForm properties={properties} onCreated={(u) => { setUnits((us) => [u, ...us]); setAdding(false); toast("Listing created"); }} />}

      <div className="block">
        <table className="qtable">
          <thead>
            <tr><th>Unit</th><th>Rent</th><th>Availability</th><th>Income ×</th><th>Min credit</th><th>Applications</th><th>Channel sync</th></tr>
          </thead>
          <tbody>
            {units.map((u) => (
              <tr key={u.id}>
                <td><div className="q-name">{u.title}</div><div className="q-sub">{u.code} · {u.bedrooms === 0 ? "Studio" : `${u.bedrooms} bed`}</div></td>
                <td>{formatMoney(u.rent)}</td>
                <td>
                  <select className="select" style={{ width: "auto", padding: "6px 8px", fontSize: 13 }} value={u.status} onChange={(e) => patch(u.id, { status: e.target.value as UnitStatus })}>
                    {UNIT_STATUSES.map((s) => <option key={s} value={s}>{UNIT_STATUS_LABELS[s]}</option>)}
                  </select>
                </td>
                <td>
                  <input type="number" step="0.5" className="input" style={{ width: 64, padding: "6px 8px", fontSize: 13 }} defaultValue={u.incomeMultiple}
                    onBlur={(e) => Number(e.target.value) !== u.incomeMultiple && patch(u.id, { incomeMultiple: Number(e.target.value) })} />
                </td>
                <td>
                  <input type="number" className="input" style={{ width: 74, padding: "6px 8px", fontSize: 13 }} defaultValue={u.minCreditScore ?? ""}
                    onBlur={(e) => e.target.value && Number(e.target.value) !== u.minCreditScore && patch(u.id, { minCreditScore: Number(e.target.value) })} />
                </td>
                <td><span className="score-chip">{appCount(u.id)}</span></td>
                <td><button className="chip-toggle" aria-pressed={false} onClick={() => toast(`${u.code} synced to external portals`)}>Sync</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddListingForm({ properties, onCreated }: { properties: { id: string; name: string }[]; onCreated: (u: Unit) => void }) {
  const [form, setForm] = React.useState({ propertyId: properties[0]?.id ?? "", code: "", title: "", bedrooms: 1, rent: "", deposit: "", incomeMultiple: 3, availableFrom: "" });
  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  async function create() {
    const r = await fetch("/api/v1/admin/units", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId: form.propertyId, code: form.code, title: form.title, bedrooms: Number(form.bedrooms),
        type: form.bedrooms === 0 ? "studio" : `${form.bedrooms}br`,
        rentMinor: Number(form.rent) * 100, depositMinor: Number(form.deposit || form.rent) * 100 * 2,
        incomeMultiple: Number(form.incomeMultiple), availableFrom: form.availableFrom ? new Date(form.availableFrom).toISOString() : new Date().toISOString(),
        description: form.title,
      }),
    });
    const j = await r.json();
    if (j.ok) onCreated(j.data);
  }

  return (
    <div className="card app-form-card" style={{ marginBottom: 16 }}>
      <div className="field-row">
        <div className="field"><label>Property</label><select className="select" value={form.propertyId} onChange={(e) => set("propertyId", e.target.value)}>{properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div className="field"><label>Unit code</label><input className="input" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="GRD-4900" /></div>
      </div>
      <div className="field"><label>Title</label><input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Bright 1-bedroom near transit" /></div>
      <div className="field-row">
        <div className="field"><label>Bedrooms</label><input type="number" className="input" value={form.bedrooms} onChange={(e) => set("bedrooms", Number(e.target.value))} /></div>
        <div className="field"><label>Monthly rent (₱)</label><input type="number" className="input" value={form.rent} onChange={(e) => set("rent", e.target.value)} placeholder="25000" /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Income multiple</label><input type="number" step="0.5" className="input" value={form.incomeMultiple} onChange={(e) => set("incomeMultiple", Number(e.target.value))} /></div>
        <div className="field"><label>Available from</label><input type="date" className="input" value={form.availableFrom} onChange={(e) => set("availableFrom", e.target.value)} /></div>
      </div>
      <Button variant="primary" onClick={create} disabled={!form.code || !form.title}><Icon name="check" size={16} /> Create listing</Button>
    </div>
  );
}
