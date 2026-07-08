import type { HTMLAttributes, Ref } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";

const priceTagVariants = cva("font-semibold text-gray-900", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-2xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export interface PriceTagProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof priceTagVariants> {
  amountCents: number;
  ref?: Ref<HTMLSpanElement>;
}

export function PriceTag({ amountCents, size, className, ref, ...props }: PriceTagProps) {
  return (
    <span ref={ref} className={cn(priceTagVariants({ size }), className)} {...props}>
      {currencyFormatter.format(amountCents / 100)}
    </span>
  );
}
