"use server";

import { removeCartItem } from "@store-demo/api-client";

import { getCartIdentity } from "../lib/get-cart-identity";

export async function removeCartItemAction({ productId }: { productId: string }): Promise<void> {
  const identity = await getCartIdentity();
  return removeCartItem({ identity, productId });
}
