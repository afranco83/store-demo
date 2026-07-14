"use server";

import { getLocale } from "next-intl/server";
import { getCart } from "@store-demo/api-client";
import type { CartItemWithProduct } from "@store-demo/shared-types";

import { translateCartItems } from "../lib/translate-cart-item";
import { getCartIdentity } from "../lib/get-cart-identity";

export async function getCartAction(): Promise<CartItemWithProduct[]> {
  const identity = await getCartIdentity();
  const [items, locale] = await Promise.all([getCart({ identity }), getLocale()]);
  return translateCartItems(items, locale);
}
