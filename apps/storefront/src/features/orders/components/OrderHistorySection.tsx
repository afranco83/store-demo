import { PackageX } from "lucide-react";
import { EmptyState, OrderSummaryCard } from "@store-demo/ui";

import { getOrdersAction } from "../api/get-orders.action";
import {
  ORDER_STATUS_BADGES,
  formatOrderItemCountLabel,
  formatOrderPlacedAtLabel,
} from "../lib/format-order";

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
          placedAtLabel={formatOrderPlacedAtLabel(order)}
          statusBadge={ORDER_STATUS_BADGES[order.status]}
          totalCents={order.totalCents}
          itemCountLabel={formatOrderItemCountLabel(order)}
        />
      ))}
    </div>
  );
}
