import * as React from "react";
import type { ApplicationStatus } from "@/lib/types";

/** Maps an application status to a stamp modifier + human label. */
const STATUS_STAMP: Record<ApplicationStatus, { cls: string; label: string }> = {
  new: { cls: "received", label: "Received" },
  incomplete: { cls: "incomplete", label: "Action needed" },
  screening: { cls: "screening", label: "Screening" },
  complete: { cls: "review", label: "Under review" },
  approved: { cls: "approved", label: "Approved" },
  conditional: { cls: "conditional", label: "Conditional" },
  declined: { cls: "declined", label: "Declined" },
};

export function Stamp({
  variant,
  children,
  className,
}: {
  variant?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={["stamp", variant, className].filter(Boolean).join(" ")}>{children}</span>;
}

export function StatusStamp({ status, className }: { status: ApplicationStatus; className?: string }) {
  const s = STATUS_STAMP[status];
  return <Stamp variant={s.cls} className={className}>{s.label}</Stamp>;
}
