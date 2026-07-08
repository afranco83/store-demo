import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CartItemWithProduct } from "@store-demo/shared-types";

import { addCartItemAction } from "../api/add-cart-item.action";
import { cartQueryKey } from "./cart-query-key";

export function useAddToCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    // apps/api trata "añadir al carrito" como fijar la cantidad recibida, no
    // sumarla (upsert con `update: { quantity }`) — sin esto, volver a añadir
    // un producto ya presente en el carrito pisaría su cantidad en vez de
    // incrementarla.
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) => {
      const currentCart = queryClient.getQueryData<CartItemWithProduct[]>(cartQueryKey) ?? [];
      const existingQuantity =
        currentCart.find((item) => item.productId === productId)?.quantity ?? 0;

      return addCartItemAction({ productId, quantity: existingQuantity + quantity });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(cartQueryKey, data);
    },
  });
}
