import type { BadgeProps } from "@store-demo/ui";

const LOW_STOCK_THRESHOLD = 5;

export function getStockBadge(
  stock: number,
): { label: string; intent: BadgeProps["intent"] } | undefined {
  if (stock === 0) {
    return { label: "Agotado", intent: "danger" };
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return { label: "Últimas unidades", intent: "warning" };
  }

  return undefined;
}
