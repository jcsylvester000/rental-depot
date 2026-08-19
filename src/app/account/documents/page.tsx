"use client";

import * as React from "react";
import { AccountShell } from "@/components/layout/AccountShell";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Stamp } from "@/components/ui/Stamp";
import { useSession } from "@/lib/client/session";
import { DocUploadButton } from "@/components/applicant/DocUploadButton";

const LOCKER = [
  { type: "gov_id", label: "Government ID", note: "Passport, driver's license, or national ID" },
  { type: "payslip", label: "Recent payslips", note: "Your latest two months" },
  { type: "income_proof", label: "Proof of income", note: "Bank statement or income letter" },
];

const KEY = "rd.locker";

export default function DocumentsPage() {
  const { user, ready } = useSession();
  const [uploaded, setUploaded] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setUploaded(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  function saveDoc(type: string, fileName: string) {
    setUploaded((u) => {
      const next = { ...u, [type]: fileName };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

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
              <DocUploadButton folder="rental-depot/locker" onUploaded={(a) => saveDoc(d.type, a.fileName)} />
            )}
          </div>
        );
      })}

      <p className="muted" style={{ fontSize: 12.5, marginTop: 16 }}>
        Accepted formats: PDF, JPG, PNG, HEIC · up to 10 MB each. Files are stored securely on Cloudinary.
      </p>
    </AccountShell>
  );
}
