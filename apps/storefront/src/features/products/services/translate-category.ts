import type { Category } from "@store-demo/shared-types";

export interface CategoryTranslation {
  name: string;
  description?: string | null;
}

export type CategoryTranslations = Record<string, CategoryTranslation>;

// Mismo criterio que translateProduct: JSON tipo TMS keyed por slug, sin
// tocar la BD. `description` es nullable en Category (a diferencia de
// Product), así que el fallback respeta un `null` original en vez de
// forzarlo a cadena vacía.
export function translateCategory(
  category: Category,
  locale: string,
  translations: CategoryTranslations,
): Category {
  const translation = translations[category.slug];
  if (locale === "es" || !translation) {
    return category;
  }

  return {
    ...category,
    name: translation.name,
    description: translation.description ?? category.description,
  };
}
