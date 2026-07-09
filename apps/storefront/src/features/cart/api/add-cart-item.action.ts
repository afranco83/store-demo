"use server";

import { addCartItem } from "@store-demo/api-client";
import type { CartItemWithProduct } from "@store-demo/shared-types";

import { getCartIdentity } from "../lib/get-cart-identity";

export async function addCartItemAction({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}): Promise<CartItemWithProduct[]> {
  const identity = await getCartIdentity();
  return addCartItem({ identity, productId, quantity });
}
