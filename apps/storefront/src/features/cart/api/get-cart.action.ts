"use server";

import { getLocale } from "next-intl/server";
import { getCart } from "@store-demo/api-client";
import type { CartItemWithProduct } from "@store-demo/shared-types";

import productTranslationsEn from "../../products/i18n/product-translations.en.json";
import {
  translateProduct,
  type ProductTranslations,
} from "../../products/services/translate-product";
import { getCartIdentity } from "../lib/get-cart-identity";

const TRANSLATIONS_BY_LOCALE: Record<string, ProductTranslations> = {
  en: productTranslationsEn,
};

export async function getCartAction(): Promise<CartItemWithProduct[]> {
  const identity = await getCartIdentity();
  const [items, locale] = await Promise.all([getCart({ identity }), getLocale()]);

  const translations = TRANSLATIONS_BY_LOCALE[locale];
  if (!translations) {
    return items;
  }
  return items.map((item) => ({
    ...item,
    product: translateProduct(item.product, locale, translations),
  }));
}
