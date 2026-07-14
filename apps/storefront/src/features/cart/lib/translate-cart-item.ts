import type { CartItemWithProduct } from "@store-demo/shared-types";

import { translateProductForLocale } from "../../products/services/translate-product";

// Único punto donde se traduce el producto embebido en un ítem de carrito —
// usado por las 3 Server Actions que devuelven CartItemWithProduct
// (get-cart/add-cart-item/update-cart-item.action.ts) para que ninguna
// pueda quedarse sirviendo el producto sin traducir por accidente.
export function translateCartItem(item: CartItemWithProduct, locale: string): CartItemWithProduct {
  return { ...item, product: translateProductForLocale(item.product, locale) };
}

export function translateCartItems(
  items: CartItemWithProduct[],
  locale: string,
): CartItemWithProduct[] {
  return items.map((item) => translateCartItem(item, locale));
}
