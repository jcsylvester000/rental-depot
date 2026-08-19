"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface UploadResult {
  created: number;
  propertiesCreated: number;
  pendingReview?: boolean;
  errors: { row: number; message: string }[];
}

/**
 * Shared CSV bulk-upload panel for listings. Reads a chosen .csv file, posts its
 * text to `endpoint`, and reports how many listings were created and any row errors.
 */
export function BulkUploadPanel({ endpoint, onImported }: { endpoint: string; onImported?: () => void }) {
  const [fileName, setFileName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<UploadResult | null>(null);
  const [error, setError] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setBusy(true); setError(""); setResult(null); setFileName(file.name);
    try {
      const csv = await file.text();
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ csv }) });
      const j = await res.json();
      if (j.ok) {
        setResult(j.data);
        if (j.data.created > 0) onImported?.();
      } else {
        setError(j.error?.message ?? "Upload failed.");
      }
    } catch {
      setError("Could not read that file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card app-form-card" style={{ marginBottom: 16 }}>
      <div className="upload-zone" style={{ marginBottom: result || error ? 14 : 0 }}>
        <div className="ic"><Icon name="upload" size={26} /></div>
        <div style={{ fontWeight: 600 }}>Upload a CSV of listings</div>
        <div className="muted" style={{ fontSize: 13, margin: "4px 0 12px" }}>
          Use the template so columns match. {fileName && <>Selected: <b>{fileName}</b></>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <a className="btn btn-quiet btn-sm" href="/api/v1/listings/template"><Icon name="file" size={14} /> Download template</a>
          <Button variant="accent" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
            <Icon name="upload" size={15} /> {busy ? "Uploading…" : "Choose CSV file"}
          </Button>
        </div>
      </div>

      {error && <div className="err-msg" role="alert"><Icon name="flag" size={14} /> {error}</div>}

      {result && (
        <div>
          <div className="trust-note" style={{ background: result.created > 0 ? "var(--verdigris-l)" : "var(--amber-l)" }}>
            <span className="tn-ic"><Icon name={result.created > 0 ? "check" : "flag"} size={16} /></span>
            <div>
              <b>{result.created}</b> listing{result.created === 1 ? "" : "s"} {result.pendingReview ? "submitted for review" : "created"}
              {result.propertiesCreated > 0 && <> · <b>{result.propertiesCreated}</b> new propert{result.propertiesCreated === 1 ? "y" : "ies"}</>}
              {result.pendingReview && <div style={{ fontSize: 13, marginTop: 4 }}>They&apos;ll appear publicly once an operator reviews and publishes them.</div>}
            </div>
          </div>
          {result.errors.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="muted" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{result.errors.length} row{result.errors.length === 1 ? "" : "s"} skipped:</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--clay-d)" }}>
                {result.errors.slice(0, 12).map((e, i) => <li key={i}>Row {e.row}: {e.message}</li>)}
                {result.errors.length > 12 && <li>…and {result.errors.length - 12} more.</li>}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
