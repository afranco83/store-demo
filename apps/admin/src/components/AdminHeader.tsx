import Link from "next/link";
import { Typography, UserMenu } from "@store-demo/ui";
import { auth, logout } from "@store-demo/auth";

const navLinkClassName = "text-sm font-medium text-gray-600 hover:text-gray-900";
const menuItemClassName =
  "w-full rounded px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-100";

// Server Component: a diferencia de SiteHeader/CartAwareNavbar de
// apps/storefront no necesita ningún estado de cliente (no hay carrito en
// admin), así que no hace falta dividirlo en dos componentes.
export async function AdminHeader() {
  const session = await auth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link href="/products">
          <Typography as="span" variant="heading" className="text-xl">
            Store Demo Admin
          </Typography>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/products" className={navLinkClassName}>
            Productos
          </Link>
          <Link href="/categories" className={navLinkClassName}>
            Categorías
          </Link>
          <Link href="/orders" className={navLinkClassName}>
            Pedidos
          </Link>
        </nav>
        {session ? (
          <UserMenu
            triggerLabel="Cuenta"
            items={
              <form action={logout}>
                <button type="submit" role="menuitem" className={menuItemClassName}>
                  Cerrar sesión
                </button>
              </form>
            }
          />
        ) : null}
      </div>
    </header>
  );
}
