import type { BadgeProps } from "@store-demo/ui";

const LOW_STOCK_THRESHOLD = 5;

export interface StockBadgeLabels {
  outOfStock: string;
  lowStock: string;
}

export function getStockBadge(
  stock: number,
  labels: StockBadgeLabels,
): { label: string; intent: BadgeProps["intent"] } | undefined {
  if (stock === 0) {
    return { label: labels.outOfStock, intent: "danger" };
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return { label: labels.lowStock, intent: "warning" };
  }

  return undefined;
}
