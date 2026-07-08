import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCartItemAction } from "../api/update-cart-item.action";
import { cartQueryKey } from "./cart-query-key";

export function useUpdateCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCartItemAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
  });
}
