import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Typography } from "@store-demo/ui";

import { Link } from "@/i18n/navigation";
import { LoginForm } from "@/features/auth/components/LoginForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.login" });
  return { title: t("pageTitle") };
}

export default async function LoginPage() {
  const t = await getTranslations("auth.login");

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        {t("pageTitle")}
      </Typography>
      <LoginForm />
      <Typography variant="caption">
        {t("noAccountText")}{" "}
        <Link href="/register" className="font-medium text-accent">
          {t("registerLink")}
        </Link>
      </Typography>
    </main>
  );
}
