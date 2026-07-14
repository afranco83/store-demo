import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Typography } from "@store-demo/ui";

import { OrderHistorySection } from "@/features/orders/components/OrderHistorySection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.orders" });
  return { title: t("pageTitle") };
}

export default async function AccountOrdersPage() {
  const t = await getTranslations("account.orders");

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        {t("pageTitle")}
      </Typography>
      <OrderHistorySection />
    </main>
  );
}
