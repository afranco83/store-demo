import type { Product } from "@store-demo/shared-types";

export interface ProductTranslation {
  name: string;
  description: string;
}

export type ProductTranslations = Record<string, ProductTranslation>;

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
