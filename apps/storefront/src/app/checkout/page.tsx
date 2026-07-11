import type { Metadata } from "next";
import { Typography } from "@store-demo/ui";

import { CheckoutWizard } from "@/features/checkout/components/CheckoutWizard";

export const metadata: Metadata = { title: "Finalizar compra" };

export default function CheckoutPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        Checkout
      </Typography>
      <CheckoutWizard />
    </main>
  );
}
