import type { Order } from "@store-demo/shared-types";

export { ORDER_STATUS_BADGES } from "@store-demo/core";

const orderDateFormatter = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" });

export function formatOrderPlacedAtLabel(order: Order): string {
  return orderDateFormatter.format(order.createdAt);
}

export function formatOrderItemCountLabel(order: Order): string {
  const count = order.items.reduce((total, item) => total + item.quantity, 0);
  return count === 1 ? "1 artículo" : `${count} artículos`;
}
