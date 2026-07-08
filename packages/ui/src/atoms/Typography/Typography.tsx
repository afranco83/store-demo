import type { ElementType, HTMLAttributes, Ref } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";

const typographyVariants = cva("text-gray-900", {
  variants: {
    variant: {
      display: "font-display text-4xl font-semibold tracking-tight sm:text-5xl",
      heading: "font-display text-2xl font-semibold tracking-tight sm:text-3xl",
      body: "text-base leading-relaxed",
      caption: "text-sm text-gray-500",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

type TypographyElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

export interface TypographyProps
  extends HTMLAttributes<HTMLElement>, VariantProps<typeof typographyVariants> {
  as?: TypographyElement;
  ref?: Ref<HTMLElement>;
}

export function Typography({ as, variant, className, ref, ...props }: TypographyProps) {
  const Component = (as ?? "p") as ElementType;

  return (
    <Component ref={ref} className={cn(typographyVariants({ variant }), className)} {...props} />
  );
}
