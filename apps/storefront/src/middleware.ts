import createIntlMiddleware from "next-intl/middleware";
import type { NextFetchEvent, NextRequest } from "next/server";
import { withAuthGuard } from "@store-demo/auth/middleware-guard";

import { routing } from "./i18n/routing";

const handleIntl = createIntlMiddleware(routing);

// Con localePrefix "as-needed", el inglés es el único locale con prefijo
// explícito ("en") — el guard necesita conocerlo para despojarlo antes de
// comparar contra protectedPaths y para anteponerlo a los redirects a
// /login (ver packages/auth/src/middleware-guard.ts).
const handleAuth = withAuthGuard({
  protectedPaths: ["/account", "/checkout"],
  localePrefixes: routing.locales.filter((locale) => locale !== routing.defaultLocale),
});

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const intlResponse = handleIntl(request);

  // next-intl puede decidir redirigir (p. ej. negociación de locale por
  // cookie/Accept-Language) — en ese caso todavía no hay nada de auth que
  // comprobar, el propio redirect ya resuelve el locale en la siguiente
  // request.
  if (intlResponse.headers.get("location")) {
    return intlResponse;
  }

  const authResponse = await handleAuth(request, event);
  if (!authResponse) {
    return intlResponse;
  }

  // Si el guard de auth ya decidió redirigir (p. ej. a /login), esa
  // respuesta no necesita las cabeceras internas de next-intl
  // (x-middleware-rewrite, usadas para reescribir "/" a "/es" en modo
  // "as-needed") — copiarlas encima dejaría una cabecera de reescritura
  // apuntando a un path distinto del destino real del redirect. El
  // navegador vuelve a pasar por este middleware al seguir el redirect, así
  // que el locale se resuelve igualmente en esa siguiente request.
  if (authResponse.headers.get("location")) {
    return authResponse;
  }

  // Propaga las cabeceras que añade next-intl (usadas por next-intl/server
  // para resolver el locale activo en Server Components) sobre la respuesta
  // final del guard de auth.
  intlResponse.headers.forEach((value, key) => {
    if (!authResponse.headers.has(key)) {
      authResponse.headers.set(key, value);
    }
  });

  return authResponse;
}

export const config = {
  // Antes solo cubría las rutas protegidas (/account, /checkout); ahora
  // tiene que correr en cualquier página para que next-intl pueda resolver
  // el locale — se excluyen API, assets de Next y ficheros estáticos.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
