import type { Product } from "@store-demo/shared-types";

import productTranslationsEn from "../i18n/product-translations.en.json";

export interface ProductTranslation {
  name: string;
  description: string;
}

export type ProductTranslations = Record<string, ProductTranslation>;

// Solo el inglés tiene fichero de traducciones hoy — nuevos locales añaden
// aquí su propia entrada. Vive aquí (no en cada api.ts/action.ts que
// necesita traducir un producto) para que todos esos call sites compartan
// una única fuente de verdad en vez de redeclarar el mismo mapa.
const TRANSLATIONS_BY_LOCALE: Record<string, ProductTranslations> = {
  en: productTranslationsEn,
};

// Traducción de contenido "tipo TMS" (JSON versionado en git, simulando un
// export de Lokalise/POEditor) keyed por slug — no toca la BD ni el pipeline
// de reset-demo-data.ts. Español (locale por defecto) siempre devuelve el
// producto tal cual viene de la API; el resto de locales caen al valor
// original si no hay traducción para ese slug (nunca deja un campo vacío).
export function translateProduct(
  product: Product,
  locale: string,
  translations: ProductTranslations,
): Product {
  const translation = translations[product.slug];
  if (locale === "es" || !translation) {
    return product;
  }

  return { ...product, name: translation.name, description: translation.description };
}

// Envoltorio de conveniencia: resuelve el mapa de traducciones del locale
// activo y lo aplica. Usar esta función (no `translateProduct` + el propio
// `TRANSLATIONS_BY_LOCALE`) desde cualquier api.ts/action.ts que necesite
// traducir un producto — `translateProduct` se mantiene exportada tal cual
// para poder testearla con mapas de traducción arbitrarios.
export function translateProductForLocale(product: Product, locale: string): Product {
  const translations = TRANSLATIONS_BY_LOCALE[locale];
  return translations ? translateProduct(product, locale, translations) : product;
}
