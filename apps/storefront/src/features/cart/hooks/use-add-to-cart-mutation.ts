import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addCartItemAction } from "../api/add-cart-item.action";
import { cartQueryKey } from "./cart-query-key";

export function useAddToCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCartItemAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
  });
}
