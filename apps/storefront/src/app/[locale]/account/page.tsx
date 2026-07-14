import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Button, Typography } from "@store-demo/ui";
import { logout } from "@store-demo/auth";

import { Link } from "@/i18n/navigation";
import { getProfileAction } from "@/features/account/api/get-profile.action";
import { EditProfileForm } from "@/features/account/components/EditProfileForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("pageTitle") };
}

export default async function AccountPage() {
  const [profile, t] = await Promise.all([getProfileAction(), getTranslations("account")]);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        {t("pageTitle")}
      </Typography>
      <EditProfileForm profile={profile} />
      <Link href="/account/orders" className="font-medium text-accent">
        {t("viewOrdersLink")}
      </Link>
      <form action={logout}>
        <Button type="submit" intent="outline">
          {t("logoutButton")}
        </Button>
      </form>
    </main>
  );
}
