import Link from "next/link";
import { Typography } from "@store-demo/ui";
import { auth } from "@store-demo/auth";

import { CartAwareNavbar } from "./CartAwareNavbar";

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
          {session ? (
            <Link href="/account">Mi cuenta</Link>
          ) : (
            <Link href="/login">Iniciar sesión</Link>
          )}
        </>
      }
    />
  );
}
