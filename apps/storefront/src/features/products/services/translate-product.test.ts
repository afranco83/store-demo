import { describe, expect, it } from "vitest";
import { createProductFixture } from "@store-demo/testing";

import { translateProduct, type ProductTranslations } from "./translate-product";

const translations: ProductTranslations = {
  "known-slug": { name: "English name", description: "English description" },
};

describe("translateProduct", () => {
  it("should return the product unchanged for the default (es) locale", () => {
    const product = createProductFixture({ slug: "known-slug", name: "Nombre" });

    expect(translateProduct(product, "es", translations)).toBe(product);
  });

  it("should apply the translation when the slug has one for a non-default locale", () => {
    const product = createProductFixture({
      slug: "known-slug",
      name: "Nombre",
      description: "Descripción",
    });

    const translated = translateProduct(product, "en", translations);

    expect(translated.name).toBe("English name");
    expect(translated.description).toBe("English description");
    expect(translated.slug).toBe("known-slug");
  });

  it("should fall back to the original product when the slug has no translation", () => {
    const product = createProductFixture({ slug: "unknown-slug", name: "Nombre" });

    expect(translateProduct(product, "en", translations)).toBe(product);
  });
});
