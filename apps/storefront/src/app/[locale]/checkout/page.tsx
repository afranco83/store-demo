import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Typography } from "@store-demo/ui";

import { CheckoutWizard } from "@/features/checkout/components/CheckoutWizard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: t("title") };
}

export default async function CheckoutPage() {
  const t = await getTranslations("checkout");

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        {t("title")}
      </Typography>
      <CheckoutWizard />
    </main>
  );
}
