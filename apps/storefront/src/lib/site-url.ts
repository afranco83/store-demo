// URL pública real de la demo (docs/ROADMAP.md, despliegue en Vercel).
// Sobreescribible vía NEXT_PUBLIC_SITE_URL si el dominio cambia — ver
// next.config.ts, que ya la inyecta con este mismo fallback.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://store-demo-storefront-kappa.vercel.app";
