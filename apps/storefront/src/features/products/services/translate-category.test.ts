import { describe, expect, it } from "vitest";
import { createCategoryFixture } from "@store-demo/testing";

import {
  translateCategory,
  translateCategoryForLocale,
  type CategoryTranslations,
} from "./translate-category";

const translations: CategoryTranslations = {
  "known-slug": { name: "English name", description: "English description" },
};

describe("translateCategory", () => {
  it("should return the category unchanged for the default (es) locale", () => {
    const category = createCategoryFixture({ slug: "known-slug", name: "Nombre" });

    expect(translateCategory(category, "es", translations)).toBe(category);
  });

  it("should apply the translation when the slug has one for a non-default locale", () => {
    const category = createCategoryFixture({ slug: "known-slug", name: "Nombre" });

    const translated = translateCategory(category, "en", translations);

    expect(translated.name).toBe("English name");
    expect(translated.description).toBe("English description");
  });

  it("should fall back to the category's own (nullable) description when the translation omits it", () => {
    const category = createCategoryFixture({
      slug: "known-slug",
      name: "Nombre",
      description: null,
    });
    const translationsWithoutDescription: CategoryTranslations = {
      "known-slug": { name: "English name" },
    };

    const translated = translateCategory(category, "en", translationsWithoutDescription);

    expect(translated.name).toBe("English name");
    expect(translated.description).toBeNull();
  });

  it("should fall back to the original category when the slug has no translation", () => {
    const category = createCategoryFixture({ slug: "unknown-slug", name: "Nombre" });

    expect(translateCategory(category, "en", translations)).toBe(category);
  });
});

describe("translateCategoryForLocale", () => {
  it("should resolve the real English translations file for a known seeded slug", () => {
    const category = createCategoryFixture({ slug: "camisetas", name: "Camisetas" });

    const translated = translateCategoryForLocale(category, "en");

    expect(translated.name).toBe("T-Shirts");
  });

  it("should return the category unchanged when there is no translations file for the locale", () => {
    const category = createCategoryFixture({ slug: "camisetas" });

    expect(translateCategoryForLocale(category, "fr")).toBe(category);
  });
});
