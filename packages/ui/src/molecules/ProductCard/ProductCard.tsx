import type { Ref } from "react";

import type { BadgeProps } from "../../atoms/Badge";
import { Badge } from "../../atoms/Badge";
import { PriceTag } from "../../atoms/PriceTag";
import { Typography } from "../../atoms/Typography";
import { cn } from "../../utils/cn";

export interface ProductCardProps {
  name: string;
  imageUrl: string;
  priceCents: number;
  stockBadge?: { label: string; intent?: BadgeProps["intent"] };
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function ProductCard({
  name,
  imageUrl,
  priceCents,
  stockBadge,
  className,
  ref,
}: ProductCardProps) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-3 rounded-lg border border-gray-200 p-3", className)}
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
        <img src={imageUrl} alt={name} loading="lazy" className="size-full object-cover" />
        {stockBadge ? (
          <Badge intent={stockBadge.intent} className="absolute top-2 right-2">
            {stockBadge.label}
          </Badge>
        ) : null}
      </div>
      <Typography as="h3" variant="body" className="font-medium">
        {name}
      </Typography>
      <PriceTag amountCents={priceCents} />
    </div>
  );
}
