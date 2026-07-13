import type { Product } from "@store-demo/shared-types";

const DEFAULT_LIMIT = 4;

export function getRelatedProducts(
  allProducts: Product[],
  currentProduct: Product,
  limit = DEFAULT_LIMIT,
): Product[] {
  return allProducts
    .filter(
      (product) =>
        product.categoryId === currentProduct.categoryId && product.id !== currentProduct.id,
    )
    .slice(0, limit);
}
