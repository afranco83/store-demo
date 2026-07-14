import { describe, expect, it } from "vitest";

import categoryTranslationsEn from "./category-translations.en.json";
import productTranslationsEn from "./product-translations.en.json";

// Red de seguridad barata: si una entrada queda con name/description vacíos
// por un error al editar el JSON, el fallback de translateProduct/
// translateCategory (services/translate-*.ts) los tomaría como "traducción
// válida" en vez de caer al valor en español — este test detecta eso antes
// de que llegue a producción. No sustituye una comprobación contra los
// slugs reales del seed (apps/api/prisma/seed-shared.ts): ese cruce
// requeriría depender de apps/api desde apps/storefront, fuera de alcance.
describe("product-translations.en.json", () => {
  it("should have a non-empty name and description for every product entry", () => {
    for (const [slug, translation] of Object.entries(productTranslationsEn)) {
      expect(translation.name, `${slug}.name`).not.toBe("");
      expect(translation.description, `${slug}.description`).not.toBe("");
    }
  });
});

describe("category-translations.en.json", () => {
  it("should have a non-empty name for every category entry", () => {
    for (const [slug, translation] of Object.entries(categoryTranslationsEn)) {
      expect(translation.name, `${slug}.name`).not.toBe("");
    }
  });
});
