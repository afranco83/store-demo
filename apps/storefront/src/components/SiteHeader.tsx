import Link from "next/link";
import { LogIn } from "lucide-react";
import { Icon, Typography, UserMenu, buttonVariants } from "@store-demo/ui";
import { auth, logout } from "@store-demo/auth";

import { CartAwareNavbar } from "./CartAwareNavbar";

const menuItemClassName =
  "w-full rounded px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-100";

export async function SiteHeader() {
  const session = await auth();

  return (
    <CartAwareNavbar
      logoSlot={
        <Link href="/">
          <Typography as="span" variant="heading" className="text-xl">
            Store Demo
          </Typography>
        </Link>
      }
      navSlot={
        <>
          <Link href="/">Inicio</Link>
          <Link href="/products">Catálogo</Link>
        </>
      }
      authSlot={
        session ? (
          <UserMenu
            triggerLabel="Cuenta"
            items={
              <>
                <Link href="/account" role="menuitem" className={menuItemClassName}>
                  Mi cuenta
                </Link>
                <Link href="/account/orders" role="menuitem" className={menuItemClassName}>
                  Mis pedidos
                </Link>
                <form action={logout}>
                  <button type="submit" role="menuitem" className={menuItemClassName}>
                    Cerrar sesión
                  </button>
                </form>
              </>
            }
          />
        ) : (
          <Link href="/login" className={buttonVariants({ intent: "ghost", size: "sm" })}>
            <Icon icon={LogIn} size="md" />
            Login
          </Link>
        )
      }
    />
  );
}
