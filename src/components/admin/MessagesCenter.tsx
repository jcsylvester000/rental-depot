"use client";

import * as React from "react";
import type { AdminQueueRow, Message, MessageTemplate, ChatStatus } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { StatusStamp } from "@/components/ui/Stamp";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/lib/client/toast";

export function MessagesCenter({ rows, templates }: { rows: AdminQueueRow[]; templates: MessageTemplate[] }) {
  const { toast } = useToast();
  const [active, setActive] = React.useState<AdminQueueRow | null>(rows[0] ?? null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [chat, setChat] = React.useState<{ status?: ChatStatus; initiatedBy?: "applicant" | "operator" }>({});
  const [draft, setDraft] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const loadThread = React.useCallback(async (ref: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/v1/applications/${ref}`);
      const j = await r.json();
      if (j.ok) { setMessages(j.data.messages); setChat({ status: j.data.chatStatus, initiatedBy: j.data.chatInitiatedBy }); }
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
    if (j.ok) {
      setMessages((m) => [...m, j.data.message]);
      setChat((c) => ({ status: j.data.chatStatus, initiatedBy: j.data.chatStatus === "pending" ? "operator" : c.initiatedBy }));
      if (j.data.chatStatus === "pending") toast("Chat request sent — waiting for the applicant to accept");
    } else {
      toast(j.error?.message ?? "Couldn't send");
    }
  }

  async function respond(action: "accept" | "decline") {
    if (!active) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/v1/admin/applications/${active.reference}/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }),
      });
      const j = await r.json();
      if (j.ok) { setChat({ status: j.data.chatStatus, initiatedBy: j.data.chatInitiatedBy }); await loadThread(active.reference); toast(action === "accept" ? "Chat accepted" : "Chat declined"); }
    } finally { setBusy(false); }
  }

  // Gate flags for the operator's perspective.
  const pendingIncoming = chat.status === "pending" && chat.initiatedBy === "applicant"; // applicant asked; operator must accept
  const pendingOutgoing = chat.status === "pending" && chat.initiatedBy === "operator"; // operator asked; waiting on applicant
  const declined = chat.status === "declined";
  const canSend = !pendingIncoming && !pendingOutgoing && !declined;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
      <div className="block" style={{ maxHeight: 560, overflowY: "auto" }}>
        {rows.map((r) => (
          <button key={r.id} onClick={() => setActive(r)} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", borderBottom: "1px solid var(--paper-3)", background: active?.id === r.id ? "var(--paper-2)" : "transparent", border: "none", cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span className="q-name">{r.applicantName}</span>
              {r.chatStatus === "pending" && r.chatInitiatedBy === "applicant"
                ? <span className="pill" style={{ fontSize: 10, background: "var(--amber-l)", color: "var(--amber-d)" }}>Chat request</span>
                : <StatusStamp status={r.status} />}
            </div>
            <div className="q-sub">{r.reference} · {r.unitCode}</div>
          </button>
        ))}
      </div>

      <div className="block" style={{ padding: 20 }}>
        {active ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div><b>{active.applicantName}</b> <span className="q-sub">· {active.reference} · {active.unitCode}</span></div>
              <StatusStamp status={active.status} />
            </div>

            {pendingIncoming && (
              <div className="trust-note" style={{ background: "var(--amber-l)", marginBottom: 14 }}>
                <span className="tn-ic"><Icon name="msg" size={16} /></span>
                <div style={{ flex: 1 }}>
                  <b>{active.applicantName}</b> wants to chat about <b>{active.unitCode}</b>. Accept to open the conversation.
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <Button variant="primary" size="sm" onClick={() => respond("accept")} disabled={busy}><Icon name="check" size={15} /> Accept</Button>
                    <Button variant="ghost" size="sm" onClick={() => respond("decline")} disabled={busy}>Decline</Button>
                  </div>
                </div>
              </div>
            )}
            {pendingOutgoing && <div className="trust-note" style={{ marginBottom: 14 }}><span className="tn-ic"><Icon name="clock" size={16} /></span><div>Chat request sent — waiting for {active.applicantName} to accept before the conversation opens.</div></div>}
            {declined && <div className="trust-note" style={{ background: "var(--clay-l)", marginBottom: 14 }}><span className="tn-ic"><Icon name="flag" size={16} /></span><div>This chat request was declined.</div></div>}

            <div className="thread" style={{ maxHeight: 340 }}>
              {loading && <p className="muted" style={{ textAlign: "center", fontSize: 13 }}>Loading…</p>}
              {!loading && messages.length === 0 && !chat.status && <p className="muted" style={{ textAlign: "center", fontSize: 13 }}>No conversation yet. Your first message sends a chat request tied to this property.</p>}
              {messages.map((m) => (
                <div key={m.id} className={`bubble ${m.from === "operator" ? "me" : m.from === "system" ? "sys" : "them"}`}>
                  {m.from !== "system" && <div className="b-meta">{m.from === "operator" ? m.authorName ?? "You" : active.applicantName} · {formatDateTime(m.createdAt)}</div>}
                  {m.body}
                </div>
              ))}
            </div>

            {canSend && (
              <div style={{ marginTop: 14 }}>
                <select className="select" style={{ marginBottom: 8 }} value="" onChange={(e) => { const t = templates.find((x) => x.id === e.target.value); if (t) setDraft(t.body); }}>
                  <option value="">Insert a template / macro…</option>
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <div className="thread-input" style={{ marginTop: 0 }}>
                  <input className="input" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={chat.status === "accepted" ? "Reply to the applicant…" : "Start a chat request about this property…"} />
                  <Button variant="primary" onClick={send} disabled={!draft.trim()}><Icon name="msg" size={15} /> {chat.status === "accepted" ? "Send" : "Send request"}</Button>
                </div>
              </div>
            )}
          </>
        ) : <p className="muted">Select a conversation.</p>}
      </div>
    </div>
  );
}
