import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CartItemWithProduct } from "@store-demo/shared-types";

import { updateCartItemAction } from "../api/update-cart-item.action";
import { cartQueryKey } from "./cart-query-key";

export function useUpdateCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCartItemAction,
    onSuccess: (updatedItem) => {
      queryClient.setQueryData<CartItemWithProduct[]>(
        cartQueryKey,
        (current) =>
          current?.map((item) => (item.productId === updatedItem.productId ? updatedItem : item)) ??
          current,
      );
    },
  });
}
