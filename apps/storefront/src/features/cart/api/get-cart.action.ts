"use server";

import { getCart } from "@store-demo/api-client";
import type { CartItemWithProduct } from "@store-demo/shared-types";

import { getCartIdentity } from "../lib/get-cart-identity";

export async function getCartAction(): Promise<CartItemWithProduct[]> {
  const identity = await getCartIdentity();
  return getCart({ identity });
}
