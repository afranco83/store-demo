import { PackageX } from "lucide-react";
import { EmptyState, OrderSummaryCard } from "@store-demo/ui";
import type { BadgeProps } from "@store-demo/ui";
import type { Order, OrderStatus } from "@store-demo/shared-types";

import { getOrdersAction } from "../api/get-orders.action";

const STATUS_BADGES: Record<OrderStatus, { label: string; intent: BadgeProps["intent"] }> = {
  pending: { label: "Pendiente", intent: "warning" },
  paid: { label: "Pagado", intent: "accent" },
  shipped: { label: "Enviado", intent: "accent" },
  delivered: { label: "Entregado", intent: "success" },
  cancelled: { label: "Cancelado", intent: "danger" },
};

const dateFormatter = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" });

function formatItemCountLabel(order: Order): string {
  const count = order.items.reduce((total, item) => total + item.quantity, 0);
  return count === 1 ? "1 artículo" : `${count} artículos`;
}

export async function OrderHistorySection() {
  const orders = await getOrdersAction();

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={PackageX}
        title="Todavía no tienes pedidos"
        description="Cuando completes una compra, aparecerá aquí."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => (
        <OrderSummaryCard
          key={order.id}
          orderId={order.id}
          placedAtLabel={dateFormatter.format(order.createdAt)}
          statusBadge={STATUS_BADGES[order.status]}
          totalCents={order.totalCents}
          itemCountLabel={formatItemCountLabel(order)}
        />
      ))}
    </div>
  );
}
