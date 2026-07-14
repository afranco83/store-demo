import type { Ref } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import { PriceTag } from "../../atoms/PriceTag";
import { Typography } from "../../atoms/Typography";
import { QuantitySelector } from "../QuantitySelector";
import { cn } from "../../utils/cn";

export interface CartLineItemProps {
  name: string;
  imageUrl: string;
  priceCents: number;
  quantity: number;
  onQuantityChange: (next: number) => void;
  onRemove: () => void;
  maxQuantity?: number;
  isUpdating?: boolean;
  /** Locale de formateo del precio (ver PriceTag), default "es-ES". */
  priceLocale?: string;
  quantityLabel?: string;
  decreaseQuantityLabel?: string;
  increaseQuantityLabel?: string;
  removeLabel?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function CartLineItem({
  name,
  imageUrl,
  priceCents,
  quantity,
  onQuantityChange,
  onRemove,
  maxQuantity,
  isUpdating = false,
  priceLocale,
  quantityLabel = "Quantity",
  decreaseQuantityLabel = "Decrease quantity",
  increaseQuantityLabel = "Increase quantity",
  removeLabel = "Remove item",
  className,
  ref,
}: CartLineItemProps) {
  return (
    <div ref={ref} className={cn("flex items-center gap-3 py-3", className)}>
      <img src={imageUrl} alt={name} className="h-16 w-auto shrink-0 rounded-md object-contain" />
      <div className="flex flex-1 flex-col gap-1">
        <Typography as="p" variant="body" className="font-medium">
          {name}
        </Typography>
        <PriceTag amountCents={priceCents} size="sm" locale={priceLocale} />
        <QuantitySelector
          value={quantity}
          onChange={onQuantityChange}
          max={maxQuantity}
          disabled={isUpdating}
          label={quantityLabel}
          decreaseLabel={decreaseQuantityLabel}
          increaseLabel={increaseQuantityLabel}
        />
      </div>
      <Button
        type="button"
        intent="ghost"
        size="sm"
        onClick={onRemove}
        disabled={isUpdating}
        aria-label={removeLabel}
      >
        <Icon icon={Trash2} size="sm" />
      </Button>
    </div>
  );
}
