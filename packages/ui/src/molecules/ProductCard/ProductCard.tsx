import type { Ref } from "react";
import { ShoppingCart } from "lucide-react";

import type { BadgeProps } from "../../atoms/Badge";
import { Badge } from "../../atoms/Badge";
import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import { PriceTag } from "../../atoms/PriceTag";
import { Typography } from "../../atoms/Typography";
import { cn } from "../../utils/cn";

export interface ProductCardProps {
  name: string;
  imageUrl: string;
  priceCents: number;
  stockBadge?: { label: string; intent?: BadgeProps["intent"] };
  onAddToCart?: () => void;
  addToCartLabel?: string;
  /** Locale de formateo del precio (ver PriceTag), default "es-ES". */
  priceLocale?: string;
  // Espejo del prop `priority` de next/image, sin depender de Next.js
  // (packages/ui es ciego al framework, AGENTS.md §1.3): las cards visibles
  // sin scroll (candidatas a LCP) lo marcan para no cargar su imagen en
  // diferido, igual criterio que AGENTS.md §9 aplica a next/image.
  priority?: boolean;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function ProductCard({
  name,
  imageUrl,
  priceCents,
  stockBadge,
  onAddToCart,
  addToCartLabel = "Add to cart",
  priceLocale,
  priority = false,
  className,
  ref,
}: ProductCardProps) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-3 rounded-lg border border-gray-200 p-3", className)}
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
        <img
          src={imageUrl}
          alt={name}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          className="size-full object-cover"
        />
        {stockBadge ? (
          <Badge intent={stockBadge.intent} className="absolute top-2 right-2">
            {stockBadge.label}
          </Badge>
        ) : null}
      </div>
      <Typography as="h3" variant="body" className="line-clamp-2 font-medium">
        {name}
      </Typography>
      <div className="flex items-center justify-between gap-2">
        <PriceTag amountCents={priceCents} locale={priceLocale} />
        {onAddToCart ? (
          // relative z-10: si quien consume la card la envuelve en un "stretched
          // link" (overlay absolute cubriendo toda la card, patrón habitual para
          // que la card entera navegue sin anidar <button> dentro de <a>), este
          // botón necesita quedar por encima de ese overlay para seguir siendo
          // clicable.
          <Button
            type="button"
            intent="primary"
            size="sm"
            onClick={onAddToCart}
            aria-label={addToCartLabel}
            className="relative z-10"
          >
            <Icon icon={ShoppingCart} size="sm" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
