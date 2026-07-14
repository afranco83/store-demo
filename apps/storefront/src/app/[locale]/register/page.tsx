import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Typography } from "@store-demo/ui";

import { Link } from "@/i18n/navigation";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.register" });
  return { title: t("pageTitle") };
}

export default async function RegisterPage() {
  const t = await getTranslations("auth.register");

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        {t("pageTitle")}
      </Typography>
      <RegisterForm />
      <Typography variant="caption">
        {t("hasAccountText")}{" "}
        <Link href="/login" className="font-medium text-accent">
          {t("loginLink")}
        </Link>
      </Typography>
    </main>
  );
}
