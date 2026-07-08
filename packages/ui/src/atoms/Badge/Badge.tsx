import type { HTMLAttributes, Ref } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";

const badgeVariants = cva("inline-flex items-center rounded-full font-medium", {
  variants: {
    intent: {
      neutral: "bg-gray-100 text-gray-800",
      accent: "bg-accent-soft text-accent",
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      danger: "bg-red-100 text-red-800",
    },
    size: {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
    },
  },
  defaultVariants: {
    intent: "neutral",
    size: "md",
  },
});

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  ref?: Ref<HTMLSpanElement>;
}

export function Badge({ className, intent, size, ref, ...props }: BadgeProps) {
  return <span ref={ref} className={cn(badgeVariants({ intent, size }), className)} {...props} />;
}
