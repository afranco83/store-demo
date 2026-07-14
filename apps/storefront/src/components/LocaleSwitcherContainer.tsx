"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LocaleSwitcher } from "@store-demo/ui";

import { getPathname, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = { es: "ES", en: "EN" };

export function LocaleSwitcherContainer() {
  // usePathname() de next-intl devuelve el pathname sin prefijo de locale
  // (p. ej. siempre "/products/algun-slug", tanto si la URL real es
  // "/products/algun-slug" como "/en/products/algun-slug") — es justo lo que
  // getPathname() espera como `href` para reconstruir la URL en cada idioma.
  // NUNCA incluye el query string (p. ej. "?category=camisetas"), así que se
  // reconstruye aparte con useSearchParams() — sin esto, cambiar de idioma
  // en /products?category=camisetas perdía el filtro de categoría activo.
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams.entries());
  const activeLocale = useLocale();
  const t = useTranslations("footer");

  const options = routing.locales.map((locale) => ({
    code: locale,
    label: LOCALE_LABELS[locale] ?? locale.toUpperCase(),
    href: getPathname({ href: { pathname, query }, locale }),
  }));

  return (
    <LocaleSwitcher options={options} activeLocale={activeLocale} groupLabel={t("languageLabel")} />
  );
}
