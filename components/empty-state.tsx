import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { IconOrb } from "@/components/ui/icon-orb";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-4 border border-dashed border-line bg-surface/60 px-5 py-10">
      <IconOrb icon={icon} tone="accent" size="lg" className="soft-pop" />
      <div>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="mt-1 max-w-md text-sm leading-6 text-secondary">
          {description}
        </p>
      </div>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex h-9 items-center justify-center rounded-full bg-ink px-4 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink/85"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}