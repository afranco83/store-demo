import type { BadgeProps } from "@store-demo/ui";
import type { OrderStatus } from "@store-demo/shared-types";

// Compartido entre apps/storefront (historial de pedidos) y apps/admin
// (gestión de pedidos, Fase 7) — 2ª aparición real del mismo concepto de
// dominio, promovido aquí en vez de duplicado (AGENTS.md §1.9).
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
