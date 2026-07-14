"use server";

import { getLocale } from "next-intl/server";
import { addCartItem } from "@store-demo/api-client";
import type { CartItemWithProduct } from "@store-demo/shared-types";

import { translateCartItems } from "../lib/translate-cart-item";
import { getCartIdentity } from "../lib/get-cart-identity";

export async function addCartItemAction({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}): Promise<CartItemWithProduct[]> {
  const identity = await getCartIdentity();
  const [items, locale] = await Promise.all([
    addCartItem({ identity, productId, quantity }),
    getLocale(),
  ]);
  return translateCartItems(items, locale);
}
