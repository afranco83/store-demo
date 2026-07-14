import { LogIn } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Icon, Typography, UserMenu, buttonVariants } from "@store-demo/ui";
import { auth, logout } from "@store-demo/auth";

import { Link } from "@/i18n/navigation";
import { CartAwareNavbar } from "./CartAwareNavbar";

const menuItemClassName =
  "w-full rounded px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-100";

export async function SiteHeader() {
  const [session, t] = await Promise.all([auth(), getTranslations("nav")]);

  return (
    <CartAwareNavbar
      cartLabel={t("openCart")}
      logoSlot={
        <Link href="/">
          <Typography as="span" variant="heading" className="text-xl">
            Store Demo
          </Typography>
        </Link>
      }
      navSlot={
        <>
          <Link href="/">{t("home")}</Link>
          <Link href="/products">{t("catalog")}</Link>
        </>
      }
      authSlot={
        session ? (
          <UserMenu
            triggerLabel={t("accountTrigger")}
            items={
              <>
                <Link href="/account" role="menuitem" className={menuItemClassName}>
                  {t("myAccount")}
                </Link>
                <Link href="/account/orders" role="menuitem" className={menuItemClassName}>
                  {t("myOrders")}
                </Link>
                <form action={logout}>
                  <button type="submit" role="menuitem" className={menuItemClassName}>
                    {t("logout")}
                  </button>
                </form>
              </>
            }
          />
        ) : (
          <Link href="/login" className={buttonVariants({ intent: "ghost", size: "sm" })}>
            <Icon icon={LogIn} size="md" />
            {t("login")}
          </Link>
        )
      }
    />
  );
}
