"use client";

import * as React from "react";
import type { AdminQueueRow, Message, MessageTemplate } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { StatusStamp } from "@/components/ui/Stamp";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/lib/client/toast";

export function MessagesCenter({ rows, templates }: { rows: AdminQueueRow[]; templates: MessageTemplate[] }) {
  const { toast } = useToast();
  const [active, setActive] = React.useState<AdminQueueRow | null>(rows[0] ?? null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [draft, setDraft] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const loadThread = React.useCallback(async (ref: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/v1/applications/${ref}`);
      const j = await r.json();
      if (j.ok) setMessages(j.data.messages);
    } finally { setLoading(false); }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (active) loadThread(active.reference);
  }, [active, loadThread]);

  async function send() {
    if (!draft.trim() || !active) return;
    const body = draft.trim();
    setDraft("");
    const r = await fetch(`/api/v1/admin/applications/${active.reference}/messages`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }),
    });
    const j = await r.json();
    if (j.ok) { setMessages((m) => [...m, j.data]); toast("Message sent"); }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
      <div className="block" style={{ maxHeight: 560, overflowY: "auto" }}>
        {rows.map((r) => (
          <button key={r.id} onClick={() => setActive(r)} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", borderBottom: "1px solid var(--paper-3)", background: active?.id === r.id ? "var(--paper-2)" : "transparent", border: "none", cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span className="q-name">{r.applicantName}</span>
              <StatusStamp status={r.status} />
            </div>
            <div className="q-sub">{r.reference} · {r.unitCode}</div>
          </button>
        ))}
      </div>

      <div className="block" style={{ padding: 20 }}>
        {active ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div><b>{active.applicantName}</b> <span className="q-sub">· {active.reference}</span></div>
              <StatusStamp status={active.status} />
            </div>
            <div className="thread" style={{ maxHeight: 340 }}>
              {loading && <p className="muted" style={{ textAlign: "center", fontSize: 13 }}>Loading…</p>}
              {!loading && messages.length === 0 && <p className="muted" style={{ textAlign: "center", fontSize: 13 }}>No messages yet.</p>}
              {messages.map((m) => (
                <div key={m.id} className={`bubble ${m.from === "operator" ? "me" : m.from === "system" ? "sys" : "them"}`}>
                  {m.from !== "system" && <div className="b-meta">{m.from === "operator" ? m.authorName ?? "You" : active.applicantName} · {formatDateTime(m.createdAt)}</div>}
                  {m.body}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <select className="select" style={{ marginBottom: 8 }} value="" onChange={(e) => { const t = templates.find((x) => x.id === e.target.value); if (t) setDraft(t.body); }}>
                <option value="">Insert a template / macro…</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <div className="thread-input" style={{ marginTop: 0 }}>
                <input className="input" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Reply to the applicant…" />
                <Button variant="primary" onClick={send} disabled={!draft.trim()}><Icon name="msg" size={15} /> Send</Button>
              </div>
            </div>
          </>
        ) : <p className="muted">Select a conversation.</p>}
      </div>
    </div>
  );
}
