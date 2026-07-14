import type { BadgeProps } from "@store-demo/ui";
import type { Order, OrderStatus } from "@store-demo/shared-types";

const ORDER_STATUS_INTENTS: Record<OrderStatus, BadgeProps["intent"]> = {
  pending: "warning",
  paid: "accent",
  shipped: "accent",
  delivered: "success",
  cancelled: "danger",
};

// Reutiliza el formatter por locale (antes de soportar locale dinámico era
// un singleton de módulo) en vez de reconstruirlo en cada pedido de una
// lista — mismo criterio que PriceTag en packages/ui.
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function getDateFormatter(locale: string): Intl.DateTimeFormat {
  let formatter = dateFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
    dateFormatters.set(locale, formatter);
  }
  return formatter;
}

export function formatOrderPlacedAtLabel(order: Order, locale: string): string {
  return getDateFormatter(locale).format(order.createdAt);
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
