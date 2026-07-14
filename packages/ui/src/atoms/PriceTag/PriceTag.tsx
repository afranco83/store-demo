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

// `Intl.NumberFormat` cachea la carga de datos ICU por locale — con solo un
// puñado de locales posibles, reutilizar la instancia evita reconstruirla en
// cada render de cada PriceTag (antes de soportar `locale` dinámico era un
// singleton de módulo; este Map conserva esa reutilización por locale).
const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(locale: string): Intl.NumberFormat {
  let formatter = currencyFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });
    currencyFormatters.set(locale, formatter);
  }
  return formatter;
}

export function PriceTag({
  amountCents,
  size,
  locale = "es-ES",
  className,
  ref,
  ...props
}: PriceTagProps) {
  const currencyFormatter = getCurrencyFormatter(locale);

  return (
    <span ref={ref} className={cn(priceTagVariants({ size }), className)} {...props}>
      {currencyFormatter.format(amountCents / 100)}
    </span>
  );
}
