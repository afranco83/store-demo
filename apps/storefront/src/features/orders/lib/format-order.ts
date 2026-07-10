import type { BadgeProps } from "@store-demo/ui";
import type { Order, OrderStatus } from "@store-demo/shared-types";

export const ORDER_STATUS_BADGES: Record<
  OrderStatus,
  { label: string; intent: BadgeProps["intent"] }
> = {
  pending: { label: "Pendiente", intent: "warning" },
  paid: { label: "Pagado", intent: "accent" },
  shipped: { label: "Enviado", intent: "accent" },
  delivered: { label: "Entregado", intent: "success" },
  cancelled: { label: "Cancelado", intent: "danger" },
};

const orderDateFormatter = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" });

export function formatOrderPlacedAtLabel(order: Order): string {
  return orderDateFormatter.format(order.createdAt);
}

export function formatOrderItemCountLabel(order: Order): string {
  const count = order.items.reduce((total, item) => total + item.quantity, 0);
  return count === 1 ? "1 artículo" : `${count} artículos`;
}
