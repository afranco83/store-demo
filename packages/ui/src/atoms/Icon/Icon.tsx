import type { Ref } from "react";
import type { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";

const iconVariants = cva("shrink-0", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-5",
      lg: "size-6",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface IconProps extends VariantProps<typeof iconVariants> {
  icon: LucideIcon;
  label?: string;
  className?: string;
  ref?: Ref<SVGSVGElement>;
}

export function Icon({ icon: LucideIconComponent, label, size, className, ref }: IconProps) {
  return (
    <LucideIconComponent
      ref={ref}
      data-testid="icon"
      className={cn(iconVariants({ size }), className)}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    />
  );
}
