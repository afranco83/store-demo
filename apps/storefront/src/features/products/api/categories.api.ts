import "server-only";

import { getLocale } from "next-intl/server";
import { getCategories as fetchCategories } from "@store-demo/api-client";
import type { Category } from "@store-demo/shared-types";

import { translateCategoryForLocale } from "../services/translate-category";

export async function getCategories(): Promise<Category[]> {
  const [categories, locale] = await Promise.all([fetchCategories(), getLocale()]);
  return categories.map((category) => translateCategoryForLocale(category, locale));
}
