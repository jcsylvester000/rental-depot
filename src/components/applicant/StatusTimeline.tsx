import type { ApplicationStatus } from "@/lib/types";
import { buildTimeline } from "@/lib/status-display";
import { Icon } from "@/components/ui/Icon";

export function StatusTimeline({ status }: { status: ApplicationStatus }) {
  const steps = buildTimeline(status);
  return (
    <div className="timeline">
      {steps.map((s) => (
        <div key={s.key} className={`tl-step ${s.state === "done" ? "done" : s.state === "current" ? "current" : ""}`}>
          <span className="tl-dot">
            {s.state === "done" ? <Icon name="check" size={14} /> : s.state === "declined" ? <Icon name="flag" size={14} /> : null}
          </span>
          <div className="tl-body">
            <h5>{s.label}</h5>
            <p>{s.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
