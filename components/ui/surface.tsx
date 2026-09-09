import * as React from "react";

import { cn } from "@/lib/utils";

export function Surface({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border border-line bg-surface p-5", className)}
      {...props}
    />
  );
}
