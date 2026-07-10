import { Typography } from "@store-demo/ui";

import { getOrdersAction } from "@/features/orders/api/get-orders.action";
import { OrdersTable } from "@/features/orders/components/OrdersTable";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getOrdersAction();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        Pedidos
      </Typography>
      <OrdersTable orders={orders} />
    </main>
  );
}
