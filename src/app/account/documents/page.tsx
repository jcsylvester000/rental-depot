"use client";

import * as React from "react";
import { AccountShell } from "@/components/layout/AccountShell";
import { Button, LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Stamp } from "@/components/ui/Stamp";
import { useSession } from "@/lib/client/session";
import { useToast } from "@/lib/client/toast";

const LOCKER = [
  { type: "gov_id", label: "Government ID", note: "Passport, driver's license, or national ID" },
  { type: "payslip", label: "Recent payslips", note: "Your latest two months" },
  { type: "income_proof", label: "Proof of income", note: "Bank statement or income letter" },
];

export default function DocumentsPage() {
  const { user, ready } = useSession();
  const { toast } = useToast();
  const [uploaded, setUploaded] = React.useState<Record<string, string>>({});

  if (ready && !user) {
    return (
      <AccountShell active="/account/documents">
        <div className="card empty-state">
          <h3>Sign in to manage your documents</h3>
          <p>Upload once and reuse across every application.</p>
          <LinkButton href="/account/login" variant="primary" style={{ marginTop: 14 }}>Sign in</LinkButton>
        </div>
      </AccountShell>
    );
  }

  function fakeUpload(type: string, label: string) {
    // Cloudinary upload is wired in Phase 7; this simulates a stored asset.
    setUploaded((u) => ({ ...u, [type]: `${label.toLowerCase().replace(/\s+/g, "-")}.pdf` }));
    toast(`${label} added to your locker`);
  }

  return (
    <AccountShell active="/account/documents">
      <span className="eyebrow">Your account</span>
      <h1 style={{ fontSize: 30, margin: "8px 0 6px" }}>Document locker</h1>
      <p className="muted" style={{ marginTop: 0, marginBottom: 24, maxWidth: "56ch" }}>
        Keep your key documents here so applications reuse them automatically. Your files are
        stored securely and only shared with a property manager when you apply.
      </p>

      {LOCKER.map((d) => {
        const file = uploaded[d.type];
        return (
          <div key={d.type} className="doc-locker-item">
            <span className="dl-ic"><Icon name="file" size={18} /></span>
            <div style={{ flex: 1 }}>
              <div className="dl-name">{d.label}</div>
              <div className="dl-meta">{file ?? d.note}</div>
            </div>
            {file ? (
              <Stamp variant="approved">Saved</Stamp>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => fakeUpload(d.type, d.label)}>
                <Icon name="upload" size={15} /> Upload
              </Button>
            )}
          </div>
        );
      })}

      <p className="muted" style={{ fontSize: 12.5, marginTop: 16 }}>
        Accepted formats: PDF, JPG, PNG, HEIC · up to 10 MB each. Secure upload is finalized in a later phase.
      </p>
    </AccountShell>
  );
}
