import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CartItemWithProduct } from "@store-demo/shared-types";

import { removeCartItemAction } from "../api/remove-cart-item.action";
import { cartQueryKey } from "./cart-query-key";

export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCartItemAction,
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<CartItemWithProduct[]>(
        cartQueryKey,
        (current) => current?.filter((item) => item.productId !== variables.productId) ?? current,
      );
    },
  });
}
