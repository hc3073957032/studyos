import * as React from "react";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

export function Progress({ value, className, ...props }: ProgressProps) {
  const normalized = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalized}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-subtle", className)}
      {...props}
    >
      <div
        className="h-full bg-accent transition-[width] duration-300"
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}
