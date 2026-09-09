import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full overflow-hidden rounded-md border border-line bg-surface px-3 text-[15px] text-ink outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-secondary/55 focus:border-accent/70 focus:ring-3 focus:ring-accent/15 rounded-md disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
