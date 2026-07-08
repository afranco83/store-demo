"use client";

import { useState } from "react";
import { Button, QuantitySelector } from "@store-demo/ui";

import { useAddToCartMutation } from "../../cart/hooks/use-add-to-cart-mutation";
import { useCartDrawerStore } from "../../cart/store/use-cart-drawer-store";

export function AddToCartButton({
  productId,
  maxQuantity,
}: {
  productId: string;
  maxQuantity: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const addToCartMutation = useAddToCartMutation();
  const openCartDrawer = useCartDrawerStore((state) => state.open);

  const isOutOfStock = maxQuantity === 0;

  function handleAddToCart() {
    addToCartMutation.mutate({ productId, quantity }, { onSuccess: () => openCartDrawer() });
  }

  return (
    <div className="flex flex-col gap-3">
      <QuantitySelector
        value={quantity}
        onChange={setQuantity}
        max={maxQuantity}
        disabled={isOutOfStock}
        label="Cantidad"
        decreaseLabel="Reducir cantidad"
        increaseLabel="Aumentar cantidad"
      />
      <Button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        isLoading={addToCartMutation.isPending}
      >
        {isOutOfStock ? "Agotado" : "Añadir al carrito"}
      </Button>
      {addToCartMutation.isError ? (
        <p role="alert" className="text-sm text-red-600">
          No se pudo añadir el producto al carrito. Inténtalo de nuevo.
        </p>
      ) : null}
    </div>
  );
}
