import Link from "next/link";
import { Typography } from "@store-demo/ui";

import { CartAwareNavbar } from "./CartAwareNavbar";

export function SiteHeader() {
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
    />
  );
}
