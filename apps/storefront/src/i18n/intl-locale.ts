// Mapa del locale corto de la app ("es"/"en") al locale BCP-47 con región
// que esperan las APIs de Intl (Intl.NumberFormat/DateTimeFormat, y la prop
// `locale` de PriceTag) — único sitio donde vive, en vez de redeclararse en
// cada componente que formatea un precio o una fecha.
const INTL_LOCALES: Record<string, string> = { es: "es-ES", en: "en-US" };

export function toIntlLocale(locale: string): string {
  return INTL_LOCALES[locale] ?? "es-ES";
}
