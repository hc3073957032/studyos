import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-subtle text-secondary",
  accent: "bg-accent-soft text-accent",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

export function IconOrb({
  icon: Icon,
  tone = "neutral",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  tone?: keyof typeof tones;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        tones[tone],
        size === "sm" && "size-7",
        size === "md" && "size-9",
        size === "lg" && "size-11",
        className,
      )}
    >
      <Icon
        className={cn(
          size === "sm" && "size-3.5",
          size === "md" && "size-4",
          size === "lg" && "size-5",
        )}
        strokeWidth={1.8}
        aria-hidden
      />
    </span>
  );
}
