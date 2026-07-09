import type { Ref } from "react";

import type { BadgeProps } from "../../atoms/Badge";
import { Badge } from "../../atoms/Badge";
import { PriceTag } from "../../atoms/PriceTag";
import { Typography } from "../../atoms/Typography";
import { cn } from "../../utils/cn";

export interface OrderSummaryCardProps {
  orderId: string;
  placedAtLabel: string;
  statusBadge: { label: string; intent?: BadgeProps["intent"] };
  totalCents: number;
  itemCountLabel: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function OrderSummaryCard({
  orderId,
  placedAtLabel,
  statusBadge,
  totalCents,
  itemCountLabel,
  className,
  ref,
}: OrderSummaryCardProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <Typography as="p" variant="body" className="font-medium">
          {`Pedido #${orderId.slice(0, 8)}`}
        </Typography>
        <Typography variant="caption">{placedAtLabel}</Typography>
        <Typography variant="caption">{itemCountLabel}</Typography>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badge intent={statusBadge.intent}>{statusBadge.label}</Badge>
        <PriceTag amountCents={totalCents} />
      </div>
    </div>
  );
}
