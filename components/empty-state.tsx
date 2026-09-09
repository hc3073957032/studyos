import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-4 overflow-hidden rounded-md border border-dashed border-line bg-surface/60 px-5 py-10">
      <div className="flex size-10 items-center justify-center bg-accent-soft text-accent">
        <Icon className="size-5" strokeWidth={1.8} aria-hidden />
      </div>
      <div>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="mt-1 max-w-md text-sm leading-6 text-secondary">
          {description}
        </p>
      </div>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex h-8 items-center justify-center bg-accent px-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}