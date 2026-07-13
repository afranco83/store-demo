import { describe, expect, it } from "vitest";
import { createProductFixture } from "@store-demo/testing";

import { getRelatedProducts } from "./get-related-products";

describe("getRelatedProducts", () => {
  it("should return products from the same category, excluding the current one", () => {
    const currentProduct = createProductFixture({ id: "current", categoryId: "cat-1" });
    const sameCategory = createProductFixture({ id: "same-category", categoryId: "cat-1" });
    const otherCategory = createProductFixture({ id: "other-category", categoryId: "cat-2" });

    const related = getRelatedProducts(
      [currentProduct, sameCategory, otherCategory],
      currentProduct,
    );

    expect(related).toEqual([sameCategory]);
  });

  it("should not include the current product even if it appears in the list", () => {
    const currentProduct = createProductFixture({ id: "current", categoryId: "cat-1" });

    const related = getRelatedProducts([currentProduct], currentProduct);

    expect(related).toEqual([]);
  });

  it("should limit the number of related products returned", () => {
    const currentProduct = createProductFixture({ id: "current", categoryId: "cat-1" });
    const sameCategoryProducts = Array.from({ length: 6 }, (_, index) =>
      createProductFixture({ id: `same-${index}`, categoryId: "cat-1" }),
    );

    const related = getRelatedProducts(
      [currentProduct, ...sameCategoryProducts],
      currentProduct,
      2,
    );

    expect(related).toHaveLength(2);
  });
});
