"use server";

import { getCart } from "@store-demo/api-client";
import type { CartItemWithProduct } from "@store-demo/shared-types";

import { getDemoUserId } from "../lib/get-demo-user-id";

export async function getCartAction(): Promise<CartItemWithProduct[]> {
  const userId = await getDemoUserId();
  return getCart({ userId });
}
