"use server";

import { removeCartItem } from "@store-demo/api-client";

import { getDemoUserId } from "../lib/get-demo-user-id";

export async function removeCartItemAction({ productId }: { productId: string }): Promise<void> {
  const userId = await getDemoUserId();
  return removeCartItem({ userId, productId });
}
