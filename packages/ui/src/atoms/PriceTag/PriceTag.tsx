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

export interface PriceTagProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof priceTagVariants> {
  amountCents: number;
  /** Locale de formateo numérico (separadores/orden de símbolo), default
   * "es-ES" — retrocompatible. La moneda se queda siempre en EUR (traducir
   * precios/monedas es un problema distinto, fuera de alcance). */
  locale?: string;
  ref?: Ref<HTMLSpanElement>;
}

export function PriceTag({
  amountCents,
  size,
  locale = "es-ES",
  className,
  ref,
  ...props
}: PriceTagProps) {
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  });

  return (
    <span ref={ref} className={cn(priceTagVariants({ size }), className)} {...props}>
      {currencyFormatter.format(amountCents / 100)}
    </span>
  );
}
