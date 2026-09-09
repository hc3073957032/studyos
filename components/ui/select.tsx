import * as React from "react";

import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full border border-line bg-surface px-3 text-[15px] text-ink outline-none transition-[border-color,box-shadow,background-color] duration-150 focus:border-accent/70 focus:ring-3 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  ),
);
Select.displayName = "Select";

export { Select };
