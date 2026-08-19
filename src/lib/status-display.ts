import type { ApplicationStatus } from "@/lib/types";

/** Plain-language explanation shown to the applicant for each state. */
export const STATUS_EXPLANATION: Record<ApplicationStatus, { headline: string; detail: string; stampVariant: string }> = {
  new: { headline: "Application received", detail: "We've got your application and will begin review shortly.", stampVariant: "received" },
  incomplete: { headline: "Something's needed from you", detail: "Please provide the requested item so we can continue.", stampVariant: "incomplete" },
  screening: { headline: "Screening in progress", detail: "We're verifying income, credit, and background. This usually takes 24–72 hours.", stampVariant: "screening" },
  complete: { headline: "Under review", detail: "Screening is done and a decision is being finalised.", stampVariant: "review" },
  approved: { headline: "Approved — welcome!", detail: "Review and sign your lease, then pay your deposit to secure the home.", stampVariant: "approved" },
  conditional: { headline: "Conditional offer", detail: "You're approved with a condition. See the details to proceed.", stampVariant: "conditional" },
  declined: { headline: "Not approved this time", detail: "This application wasn't successful. You're welcome to apply for other homes.", stampVariant: "declined" },
};

export type StepState = "done" | "current" | "upcoming" | "declined";

export interface TimelineStep {
  key: string;
  label: string;
  description: string;
  state: StepState;
}

/** Build a 4-stage timeline (Submitted → Screening → Decision → Lease) for a status. */
export function buildTimeline(status: ApplicationStatus): TimelineStep[] {
  const declined = status === "declined";
  const conditional = status === "conditional";
  const incomplete = status === "incomplete";

  // Rank the current status along the main pipeline.
  const rankMap: Record<ApplicationStatus, number> = {
    new: 0, incomplete: 0, screening: 1, complete: 2, approved: 3, conditional: 3, declined: 2,
  };
  const rank = rankMap[status];

  const defs: { key: string; label: string; description: string }[] = [
    { key: "submitted", label: "Submitted", description: "Your application and documents were received." },
    { key: "screening", label: "Screening", description: "Income, credit, background, and eviction checks." },
    { key: "decision", label: "Decision", description: "The operator reviews against consistent criteria." },
    { key: "lease", label: "Lease & move-in", description: "Sign the lease, pay the deposit, and get your keys." },
  ];

  return defs.map((d, i) => {
    let state: StepState;
    if (declined && i === 2) state = "declined";
    else if (i < rank) state = "done";
    else if (i === rank) state = incomplete && i === 0 ? "current" : declined ? "done" : "current";
    else state = "upcoming";
    if (i === 0) state = "done"; // submitted is always done once tracking exists
    if (conditional && i === 2) state = "current";
    return { ...d, state };
  });
}
