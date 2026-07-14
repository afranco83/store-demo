import { defineRouting } from "next-intl/routing";

// "as-needed": el español (idioma por defecto de la demo) no lleva prefijo
// (/products), el inglés sí (/en/products) — minimiza el impacto sobre las
// rutas y los E2E existentes, que ya asumen español sin prefijo.
//
// localeDetection: false — sin esto, next-intl negocia el locale por el
// header Accept-Language del navegador en la primera visita sin cookie, y
// redirige "/" a "/en" cuando el navegador pide inglés (el caso por defecto
// en Chromium/Playwright, comprobado en real: rompía los 6 E2E existentes,
// que asumen español en "/" sin condiciones). El cambio de idioma pasa
// siempre por el LocaleSwitcher (prefijo de URL explícito), no por
// negociación automática — misma UX que la app tenía antes de i18n.
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
