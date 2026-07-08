"use client";

import Link from "next/link";
import { Navbar, Typography } from "@store-demo/ui";

import { useCart } from "@/features/cart/hooks/use-cart";
import { useCartDrawerStore } from "@/features/cart/store/use-cart-drawer-store";

export function SiteHeader() {
  const cartQuery = useCart();
  const openCartDrawer = useCartDrawerStore((state) => state.open);

  const cartItemCount = (cartQuery.data ?? []).reduce((total, item) => total + item.quantity, 0);

  return (
    <Navbar
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
      cartItemCount={cartItemCount}
      onCartClick={openCartDrawer}
      cartLabel="Abrir carrito"
    />
  );
}
