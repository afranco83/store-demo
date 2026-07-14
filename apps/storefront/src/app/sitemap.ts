import type { MetadataRoute } from "next";

import { getProducts } from "@/features/products/api/products.api";
import { SITE_URL } from "@/lib/site-url";

// Mismo motivo que products/page.tsx: el revalidate: 60 de getProducts()
// haría que Next intentara pre-renderizar esto en build time, lo que rompe
// en CI (apps/api no está levantado durante `next build`).
export const dynamic = "force-dynamic";

// `localePrefix: "as-needed"` (apps/storefront/src/i18n/routing.ts): el
// español (por defecto) no lleva prefijo, el inglés sí (/en/...) — cada
// entrada declara ambas variantes como alternates.languages (hreflang) en
// vez de listarlas como URLs independientes.
function localizedEntry(
  path: string,
  rest: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    alternates: {
      languages: {
        es: `${SITE_URL}${path}`,
        en: `${SITE_URL}/en${path}`,
      },
    },
    ...rest,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  const staticRoutes: MetadataRoute.Sitemap = [
    localizedEntry("", { changeFrequency: "daily", priority: 1 }),
    localizedEntry("/products", { changeFrequency: "daily", priority: 0.9 }),
    localizedEntry("/login", { changeFrequency: "yearly", priority: 0.2 }),
    localizedEntry("/register", { changeFrequency: "yearly", priority: 0.2 }),
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) =>
    localizedEntry(`/products/${product.slug}`, {
      lastModified: product.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  return [...staticRoutes, ...productRoutes];
}
