import { useQuery } from "@tanstack/react-query";

import { getCartAction } from "../api/get-cart.action";
import { cartQueryKey } from "./cart-query-key";

export function useCart() {
  return useQuery({
    queryKey: cartQueryKey,
    queryFn: () => getCartAction(),
  });
}
