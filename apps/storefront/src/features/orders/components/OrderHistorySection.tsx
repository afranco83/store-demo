import { PackageX } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { EmptyState, OrderSummaryCard } from "@store-demo/ui";

import { toIntlLocale } from "@/i18n/intl-locale";
import { getOrdersAction } from "../api/get-orders.action";
import {
  formatOrderPlacedAtLabel,
  getOrderItemCount,
  getOrderStatusIntent,
} from "../lib/format-order";

export async function OrderHistorySection() {
  const [orders, locale, t, tOrders, tOrderStatus] = await Promise.all([
    getOrdersAction(),
    getLocale(),
    getTranslations("account.orders"),
    getTranslations("orders"),
    getTranslations("orderStatus"),
  ]);

  if (orders.length === 0) {
    return (
      <EmptyState icon={PackageX} title={t("emptyTitle")} description={t("emptyDescription")} />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => (
        <OrderSummaryCard
          key={order.id}
          orderId={order.id}
          title={(shortId) => tOrders("title", { shortId })}
          placedAtLabel={formatOrderPlacedAtLabel(order, toIntlLocale(locale))}
          statusBadge={{
            label: tOrderStatus(order.status),
            intent: getOrderStatusIntent(order.status),
          }}
          totalCents={order.totalCents}
          itemCountLabel={tOrders("itemCount", { count: getOrderItemCount(order) })}
          priceLocale={toIntlLocale(locale)}
        />
      ))}
    </div>
  );
}
