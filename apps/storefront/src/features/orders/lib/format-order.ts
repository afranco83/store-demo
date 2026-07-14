import type { BadgeProps } from "@store-demo/ui";
import type { Order, OrderStatus } from "@store-demo/shared-types";

const ORDER_STATUS_INTENTS: Record<OrderStatus, BadgeProps["intent"]> = {
  pending: "warning",
  paid: "accent",
  shipped: "accent",
  delivered: "success",
  cancelled: "danger",
};

export function formatOrderPlacedAtLabel(order: Order, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(order.createdAt);
}

export function getOrderItemCount(order: Order): number {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

// El label lo construye el llamador (t("orderStatus." + status)) — este
// helper solo resuelve el `intent` visual de cada estado, compartido con
// apps/admin (@store-demo/core) pero sin importar de ahí el label en
// español (aquí es locale-aware).
export function getOrderStatusIntent(status: OrderStatus): BadgeProps["intent"] {
  return ORDER_STATUS_INTENTS[status];
}
