"use client";

import { useSaved } from "@/lib/client/saved";
import { useToast } from "@/lib/client/toast";
import { Icon } from "@/components/ui/Icon";

export function SaveButton({
  unitId,
  variant = "icon",
  label,
}: {
  unitId: string;
  variant?: "icon" | "full";
  label?: string;
}) {
  const { has, toggle } = useSaved();
  const { toast } = useToast();
  const saved = has(unitId);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(unitId);
    toast(saved ? "Removed from saved" : "Saved — find it under your saved listings");
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`btn ${saved ? "btn-accent" : "btn-ghost"}`}
        aria-pressed={saved}
      >
        <Icon name="heart" size={16} /> {saved ? "Saved" : label ?? "Save this home"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="save-heart"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save this home"}
      title={saved ? "Saved" : "Save"}
      data-saved={saved}
    >
      <Icon name="heart" size={17} />
    </button>
  );
}
