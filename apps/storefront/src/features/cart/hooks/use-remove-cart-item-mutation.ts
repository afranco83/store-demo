import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeCartItemAction } from "../api/remove-cart-item.action";
import { cartQueryKey } from "./cart-query-key";

export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCartItemAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
  });
}
