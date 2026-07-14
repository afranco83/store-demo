import "server-only";

import { getLocale } from "next-intl/server";
import {
  getProductBySlug as fetchProductBySlug,
  getProducts as fetchProducts,
} from "@store-demo/api-client";
import type { Product } from "@store-demo/shared-types";

import productTranslationsEn from "../i18n/product-translations.en.json";
import { translateProduct, type ProductTranslations } from "../services/translate-product";

// Solo el inglés tiene fichero de traducciones hoy (Fase de i18n) — nuevos
// locales añaden aquí su propia entrada, sin tocar el resto de este módulo.
const TRANSLATIONS_BY_LOCALE: Record<string, ProductTranslations> = {
  en: productTranslationsEn,
};

function translateForLocale(product: Product, locale: string): Product {
  const translations = TRANSLATIONS_BY_LOCALE[locale];
  return translations ? translateProduct(product, locale, translations) : product;
}

export async function getProductBySlug({ slug }: { slug: string }): Promise<Product> {
  const [product, locale] = await Promise.all([fetchProductBySlug({ slug }), getLocale()]);
  return translateForLocale(product, locale);
}

export async function getProducts({ categorySlug }: { categorySlug?: string } = {}): Promise<
  Product[]
> {
  const [products, locale] = await Promise.all([fetchProducts({ categorySlug }), getLocale()]);
  return products.map((product) => translateForLocale(product, locale));
}
