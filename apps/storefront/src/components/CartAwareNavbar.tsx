"use client";

import type { ReactNode } from "react";
import { Navbar } from "@store-demo/ui";

import { useCart } from "@/features/cart/hooks/use-cart";
import { useCartDrawerStore } from "@/features/cart/store/use-cart-drawer-store";

export function CartAwareNavbar({
  logoSlot,
  navSlot,
  authSlot,
  cartLabel,
}: {
  logoSlot: ReactNode;
  navSlot: ReactNode;
  authSlot: ReactNode;
  cartLabel: string;
}) {
  const cartQuery = useCart();
  const openCartDrawer = useCartDrawerStore((state) => state.open);

  const cartItemCount = (cartQuery.data ?? []).reduce((total, item) => total + item.quantity, 0);

  return (
    <Navbar
      logoSlot={logoSlot}
      navSlot={navSlot}
      authSlot={authSlot}
      cartItemCount={cartItemCount}
      onCartClick={openCartDrawer}
      cartLabel={cartLabel}
    />
  );
}
