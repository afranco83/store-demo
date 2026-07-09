import { Typography } from "@store-demo/ui";

import { OrderHistorySection } from "@/features/orders/components/OrderHistorySection";

export default function AccountOrdersPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        Mis pedidos
      </Typography>
      <OrderHistorySection />
    </main>
  );
}
