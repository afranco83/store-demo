"use server";

import { updateCartItem } from "@store-demo/api-client";
import type { CartItemWithProduct } from "@store-demo/shared-types";

import { getCartIdentity } from "../lib/get-cart-identity";

export async function updateCartItemAction({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}): Promise<CartItemWithProduct> {
  const identity = await getCartIdentity();
  return updateCartItem({ identity, productId, quantity });
}
