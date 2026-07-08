"use client";

import { useState } from "react";
import { CartDrawer, type CartDrawerItem } from "@store-demo/ui";

import { useCart } from "../hooks/use-cart";
import { useRemoveCartItemMutation } from "../hooks/use-remove-cart-item-mutation";
import { useUpdateCartItemMutation } from "../hooks/use-update-cart-item-mutation";
import { useCartDrawerStore } from "../store/use-cart-drawer-store";

export function CartDrawerContainer() {
  const isOpen = useCartDrawerStore((state) => state.isOpen);
  const close = useCartDrawerStore((state) => state.close);

  const cartQuery = useCart();
  const updateCartItemMutation = useUpdateCartItemMutation();
  const removeCartItemMutation = useRemoveCartItemMutation();
  // updateCartItemMutation/removeCartItemMutation son instancias únicas
  // compartidas por todas las líneas del carrito: su .isPending/.variables
  // solo reflejan la última llamada, no una por ítem. Se rastrea aquí el
  // conjunto de productos con una petición en curso para que marcar
  // "actualizando" un ítem no reactive por error otro que sigue pendiente.
  const [pendingProductIds, setPendingProductIds] = useState<ReadonlySet<string>>(new Set());

  const cartItems = cartQuery.data ?? [];

  const subtotalCents = cartItems.reduce(
    (total, item) => total + item.product.priceCents * item.quantity,
    0,
  );

  function markPending(productId: string) {
    setPendingProductIds((current) => new Set(current).add(productId));
  }

  function clearPending(productId: string) {
    setPendingProductIds((current) => {
      const next = new Set(current);
      next.delete(productId);
      return next;
    });
  }

  const drawerItems: CartDrawerItem[] = cartItems.map((item) => ({
    id: item.id,
    name: item.product.name,
    imageUrl: item.product.imageUrl,
    priceCents: item.product.priceCents,
    quantity: item.quantity,
    maxQuantity: item.product.stock,
    isUpdating: pendingProductIds.has(item.productId),
    quantityLabel: "Cantidad",
    decreaseQuantityLabel: "Reducir cantidad",
    increaseQuantityLabel: "Aumentar cantidad",
    removeLabel: "Eliminar producto",
    onQuantityChange: (next) => {
      markPending(item.productId);
      // mutateAsync (no mutate con callbacks) porque updateCartItemMutation
      // es una única instancia compartida: si dos ítems mutan a la vez, la
      // segunda llamada a mutate() desengancha al observer de la primera
      // mutación y su onSettled nunca llega a dispararse. La promesa que
      // devuelve mutateAsync sí está atada a esta ejecución concreta.
      void updateCartItemMutation
        .mutateAsync({ productId: item.productId, quantity: next })
        .catch(() => {})
        .finally(() => clearPending(item.productId));
    },
    onRemove: () => {
      markPending(item.productId);
      void removeCartItemMutation
        .mutateAsync({ productId: item.productId })
        .catch(() => {})
        .finally(() => clearPending(item.productId));
    },
  }));

  const errorMessage =
    cartQuery.isError || updateCartItemMutation.isError || removeCartItemMutation.isError
      ? "No se pudo actualizar el carrito. Inténtalo de nuevo."
      : undefined;

  return (
    <CartDrawer
      isOpen={isOpen}
      onClose={close}
      items={drawerItems}
      subtotalCents={subtotalCents}
      isLoading={cartQuery.isLoading}
      errorMessage={errorMessage}
      title="Carrito"
      closeLabel="Cerrar carrito"
      emptyStateTitle="Tu carrito está vacío"
      emptyStateDescription="Añade productos del catálogo para verlos aquí."
      subtotalLabel="Subtotal"
    />
  );
}
