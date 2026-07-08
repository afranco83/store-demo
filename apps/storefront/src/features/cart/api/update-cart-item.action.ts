"use server";

import { updateCartItem } from "@store-demo/api-client";
import type { CartItemWithProduct } from "@store-demo/shared-types";

import { getDemoUserId } from "../lib/get-demo-user-id";

export async function updateCartItemAction({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}): Promise<CartItemWithProduct> {
  const userId = await getDemoUserId();
  return updateCartItem({ userId, productId, quantity });
}
