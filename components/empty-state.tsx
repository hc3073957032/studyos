import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-4 border border-dashed border-line bg-surface/60 px-5 py-10">
      <div className="flex size-10 items-center justify-center bg-accent-soft text-accent">
        <Icon className="size-5" strokeWidth={1.8} aria-hidden />
      </div>
      <div>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="mt-1 max-w-md text-sm leading-6 text-secondary">
          {description}
        </p>
      </div>
      {actionLabel ? (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
