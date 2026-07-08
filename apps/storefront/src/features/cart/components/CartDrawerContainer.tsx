"use client";

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

  const cartItems = cartQuery.data ?? [];

  const subtotalCents = cartItems.reduce(
    (total, item) => total + item.product.priceCents * item.quantity,
    0,
  );

  const drawerItems: CartDrawerItem[] = cartItems.map((item) => ({
    id: item.id,
    name: item.product.name,
    imageUrl: item.product.imageUrl,
    priceCents: item.product.priceCents,
    quantity: item.quantity,
    maxQuantity: item.product.stock,
    isUpdating:
      (updateCartItemMutation.isPending &&
        updateCartItemMutation.variables?.productId === item.productId) ||
      (removeCartItemMutation.isPending &&
        removeCartItemMutation.variables?.productId === item.productId),
    onQuantityChange: (next) =>
      updateCartItemMutation.mutate({ productId: item.productId, quantity: next }),
    onRemove: () => removeCartItemMutation.mutate({ productId: item.productId }),
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
