"use server";

import { getLocale } from "next-intl/server";
import { updateCartItem } from "@store-demo/api-client";
import type { CartItemWithProduct } from "@store-demo/shared-types";

import { translateCartItem } from "../lib/translate-cart-item";
import { getCartIdentity } from "../lib/get-cart-identity";

export async function updateCartItemAction({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}): Promise<CartItemWithProduct> {
  const identity = await getCartIdentity();
  const [item, locale] = await Promise.all([
    updateCartItem({ identity, productId, quantity }),
    getLocale(),
  ]);
  return translateCartItem(item, locale);
}
