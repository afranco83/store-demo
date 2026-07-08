import type { HTMLAttributes, Ref } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-current border-t-transparent",
  {
    variants: {
      size: {
        sm: "size-4 border-2",
        md: "size-6 border-2",
        lg: "size-8 border-[3px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface SpinnerProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof spinnerVariants> {
  label?: string;
  ref?: Ref<HTMLSpanElement>;
}

export function Spinner({ className, size, label = "Loading", ref, ...props }: SpinnerProps) {
  return (
    <span role="status" ref={ref} className={cn(spinnerVariants({ size }), className)} {...props}>
      <span className="sr-only">{label}</span>
    </span>
  );
}
