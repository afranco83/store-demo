import "server-only";

import { getLocale } from "next-intl/server";
import { getCategories as fetchCategories } from "@store-demo/api-client";
import type { Category } from "@store-demo/shared-types";

import categoryTranslationsEn from "../i18n/category-translations.en.json";
import { translateCategory, type CategoryTranslations } from "../services/translate-category";

const TRANSLATIONS_BY_LOCALE: Record<string, CategoryTranslations> = {
  en: categoryTranslationsEn,
};

export async function getCategories(): Promise<Category[]> {
  const [categories, locale] = await Promise.all([fetchCategories(), getLocale()]);
  const translations = TRANSLATIONS_BY_LOCALE[locale];
  if (!translations) {
    return categories;
  }
  return categories.map((category) => translateCategory(category, locale, translations));
}
