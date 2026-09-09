import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full overflow-hidden rounded-md border border-line bg-surface px-3 py-2 text-[15px] leading-6 text-ink outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-secondary/55 focus:border-accent/70 focus:ring-3 focus:ring-accent/15 rounded-md disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
