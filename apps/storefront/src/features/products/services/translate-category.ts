import type { Category } from "@store-demo/shared-types";

import categoryTranslationsEn from "../i18n/category-translations.en.json";

export interface CategoryTranslation {
  name: string;
  description?: string | null;
}

export type CategoryTranslations = Record<string, CategoryTranslation>;

const TRANSLATIONS_BY_LOCALE: Record<string, CategoryTranslations> = {
  en: categoryTranslationsEn,
};

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

// Envoltorio de conveniencia, mismo motivo que translateProductForLocale en
// translate-product.ts: una única fuente de verdad para el mapa de
// traducciones por locale, en vez de redeclararlo en cada api.ts/action.ts.
export function translateCategoryForLocale(category: Category, locale: string): Category {
  const translations = TRANSLATIONS_BY_LOCALE[locale];
  return translations ? translateCategory(category, locale, translations) : category;
}
