import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-[background-color,color,transform] duration-150 outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent/40 rounded-md active:scale-[0.985]",
  {
    variants: {
      variant: {
        default: "bg-ink text-white hover:bg-ink/85",
        primary: "bg-accent text-white hover:bg-accent/90",
        secondary: "bg-subtle text-ink hover:bg-line/70",
        outline: "border border-line bg-transparent text-ink hover:bg-subtle",
        ghost: "bg-transparent text-secondary hover:bg-subtle hover:text-ink",
        danger: "bg-danger text-white hover:bg-danger/85",
      },
      size: {
        sm: "h-8 px-3",
        default: "h-9 px-4",
        lg: "h-11 px-5",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
