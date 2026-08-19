"use client";

import * as React from "react";
import Link from "next/link";
import type { AdminQueueRow, UnitSummary, ApplicationStatus } from "@/lib/types";
import { APPLICATION_STATUSES } from "@/lib/types";
import { APPLICATION_STATUS_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { StatusStamp } from "@/components/ui/Stamp";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/lib/client/toast";

interface Filters {
  search: string;
  status: ApplicationStatus | "";
  unitId: string;
  incompleteOnly: boolean;
  sort: "newest" | "oldest" | "score" | "completeness";
}
const EMPTY: Filters = { search: "", status: "", unitId: "", incompleteOnly: false, sort: "newest" };

interface SavedView {
  name: string;
  filters: Filters;
}

export function QueueView({ rows, units }: { rows: AdminQueueRow[]; units: UnitSummary[] }) {
  const { toast } = useToast();
  const [filters, setFilters] = React.useState<Filters>(EMPTY);
  const [view, setView] = React.useState<"list" | "board">("list");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [savedViews, setSavedViews] = React.useState<SavedView[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("rd.savedViews");
      if (raw) setSavedViews(JSON.parse(raw)); // eslint-disable-line react-hooks/set-state-in-effect
    } catch {
      /* ignore */
    }
  }, []);

  const update = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters((f) => ({ ...f, [k]: v }));

  const filtered = React.useMemo(() => {
    let list = rows.filter((r) => {
      if (filters.status && r.status !== filters.status) return false;
      if (filters.unitId && r.unitId !== filters.unitId) return false;
      if (filters.incompleteOnly && !r.flags.includes("incomplete")) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!(r.applicantName.toLowerCase().includes(q) || r.reference.toLowerCase().includes(q) || r.unitCode.toLowerCase().includes(q) || r.applicantEmail.toLowerCase().includes(q))) return false;
      }
      return true;
    });
    if (filters.sort === "oldest") list = [...list].sort((a, b) => ((a.submittedAt ?? "") < (b.submittedAt ?? "") ? -1 : 1));
    else if (filters.sort === "score") list = [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    else if (filters.sort === "completeness") list = [...list].sort((a, b) => b.completenessPct - a.completenessPct);
    else list = [...list].sort((a, b) => ((a.submittedAt ?? "") < (b.submittedAt ?? "") ? 1 : -1));
    return list;
  }, [rows, filters]);

  function toggleSel(id: string) {
    setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function saveView() {
    const name = prompt("Name this view (e.g. 'Incomplete this week')");
    if (!name) return;
    const next = [...savedViews, { name, filters }];
    setSavedViews(next);
    try { localStorage.setItem("rd.savedViews", JSON.stringify(next)); } catch { /* ignore */ }
    toast("View saved");
  }

  return (
    <div>
      {/* fair-housing note */}
      <div className="trust-note" style={{ marginBottom: 16 }}>
        <span className="tn-ic"><Icon name="shield" size={16} /></span>
        <div>Filter and sort on lawful, decision-relevant signals only. Protected attributes are never available here, and the same criteria apply to every applicant.</div>
      </div>

      {/* controls */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        <div className="top-search" style={{ flex: "1 1 220px" }}>
          <Icon name="search" size={16} />
          <input style={{ width: "100%" }} placeholder="Search name, email, unit, or ID…" value={filters.search} onChange={(e) => update("search", e.target.value)} />
        </div>
        <select className="select" style={{ width: "auto" }} value={filters.status} onChange={(e) => update("status", e.target.value as Filters["status"])}>
          <option value="">All statuses</option>
          {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{APPLICATION_STATUS_LABELS[s]}</option>)}
        </select>
        <select className="select" style={{ width: "auto" }} value={filters.unitId} onChange={(e) => update("unitId", e.target.value)}>
          <option value="">All units</option>
          {units.map((u) => <option key={u.id} value={u.id}>{u.code}</option>)}
        </select>
        <select className="select" style={{ width: "auto" }} value={filters.sort} onChange={(e) => update("sort", e.target.value as Filters["sort"])}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="score">Highest score</option>
          <option value="completeness">Most complete</option>
        </select>
        <label className="check-row" style={{ padding: 0 }}>
          <input type="checkbox" checked={filters.incompleteOnly} onChange={(e) => update("incompleteOnly", e.target.checked)} /> Incomplete only
        </label>
        <div className="view-toggle">
          <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>List</button>
          <button className={view === "board" ? "active" : ""} onClick={() => setView("board")}>Board</button>
        </div>
        <Button variant="ghost" size="sm" onClick={saveView}><Icon name="plus" size={14} /> Save view</Button>
      </div>

      {savedViews.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {savedViews.map((v, i) => (
            <button key={i} className="chip-toggle" onClick={() => setFilters(v.filters)}>{v.name}</button>
          ))}
          <button className="chip-toggle" onClick={() => setFilters(EMPTY)}>Clear</button>
        </div>
      )}

      {selected.size > 0 && (
        <div className="bulk-bar">
          <b>{selected.size} selected</b>
          <button className="btn btn-ghost btn-sm" onClick={() => toast(`Message sent to ${selected.size} applicants`)} style={{ background: "rgba(255,255,255,.12)", color: "var(--paper)", borderColor: "transparent" }}>Message</button>
          <button className="btn btn-ghost btn-sm" onClick={() => toast(`Exported ${selected.size} applications`)} style={{ background: "rgba(255,255,255,.12)", color: "var(--paper)", borderColor: "transparent" }}>Export</button>
          <button className="btn btn-quiet btn-sm" onClick={() => setSelected(new Set())} style={{ color: "var(--paper)", marginLeft: "auto" }}>Clear</button>
        </div>
      )}

      <div className="results-count" style={{ marginBottom: 10 }}><b>{filtered.length}</b> applications</div>

      {view === "list" ? (
        <div className="block">
          <table className="qtable">
            <thead>
              <tr>
                <th style={{ width: 34 }}></th>
                <th>Applicant</th><th>Unit</th><th>Status</th><th>Completeness</th><th>Score</th><th>Flags</th><th>Submitted</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSel(r.id)} aria-label={`Select ${r.applicantName}`} /></td>
                  <td><div className="q-name">{r.applicantName}</div><div className="q-sub">{r.reference}</div></td>
                  <td className="mono" style={{ fontSize: 13 }}>{r.unitCode}</td>
                  <td><StatusStamp status={r.status} /></td>
                  <td><div className="meter"><i style={{ width: `${r.completenessPct}%` }} /></div><span className="q-sub">{r.completenessPct}%</span></td>
                  <td>{r.score != null ? <span className={`score-chip ${r.score >= 80 ? "good" : ""}`}>{r.score}</span> : <span className="muted">—</span>}</td>
                  <td>{r.flags.filter((f) => f !== "incomplete").map((f) => <span key={f} className="flag-chip">{f}</span>)}{r.flags.length === 0 && <span className="muted">—</span>}</td>
                  <td className="q-sub">{formatDate(r.submittedAt)}</td>
                  <td><Link href={`/admin/applicant/${r.reference}`} className="btn btn-ghost btn-sm">Review</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="board">
          {(["new", "screening", "complete", "approved"] as ApplicationStatus[]).map((st) => {
            const items = filtered.filter((r) => (st === "approved" ? ["approved", "conditional", "declined"].includes(r.status) : st === "new" ? ["new", "incomplete"].includes(r.status) : r.status === st));
            const label = st === "new" ? "Received" : st === "approved" ? "Decided" : APPLICATION_STATUS_LABELS[st];
            return (
              <div key={st} className="board-col">
                <h4>{label}<span>{items.length}</span></h4>
                {items.map((r) => (
                  <Link key={r.id} href={`/admin/applicant/${r.reference}`} className="board-card">
                    <div className="bc-name">{r.applicantName}</div>
                    <div className="bc-meta">{r.reference} · {r.unitCode}</div>
                    {r.score != null && <div style={{ marginTop: 6 }}><span className={`score-chip ${r.score >= 80 ? "good" : ""}`}>{r.score}</span></div>}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
