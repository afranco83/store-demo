import "server-only";

import { getLocale } from "next-intl/server";
import {
  getProductBySlug as fetchProductBySlug,
  getProducts as fetchProducts,
} from "@store-demo/api-client";
import type { Product } from "@store-demo/shared-types";

import { translateProductForLocale } from "../services/translate-product";

export async function getProductBySlug({ slug }: { slug: string }): Promise<Product> {
  const [product, locale] = await Promise.all([fetchProductBySlug({ slug }), getLocale()]);
  return translateProductForLocale(product, locale);
}

export async function getProducts({ categorySlug }: { categorySlug?: string } = {}): Promise<
  Product[]
> {
  const [products, locale] = await Promise.all([fetchProducts({ categorySlug }), getLocale()]);
  return products.map((product) => translateProductForLocale(product, locale));
}
