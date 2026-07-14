import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { UserRole } from "@store-demo/shared-types";
import { authConfig } from "./auth.config";

// Instancia de auth() propia para middleware (Edge runtime): usa la config
// edge-safe, nunca la config completa con el Credentials provider.
const { auth } = NextAuth(authConfig);

// Despoja un prefijo de locale ("/en/account" -> { locale: "en", pathname:
// "/account" }) para poder comparar protectedPaths sin importar el idioma
// activo (i18n, apps/storefront). Sin locales configurados (apps/admin, que
// no usa i18n) es un no-op: locale siempre undefined, pathname sin tocar.
function stripLocalePrefix(
  pathname: string,
  localePrefixes: string[],
): { locale: string | undefined; pathname: string } {
  for (const locale of localePrefixes) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return { locale, pathname: pathname.slice(locale.length + 1) || "/" };
    }
  }
  return { locale: undefined, pathname };
}

// Reutilizable desde apps/storefront y apps/admin (Fase 7) para proteger
// prefijos de ruta — redirige a /login con callbackUrl si no hay sesión, y
// opcionalmente exige un rol concreto (apps/admin: solo "admin"), redirigiendo
// a `forbiddenRedirectPath` si la sesión es válida pero el rol no coincide.
// `requiredRole` es opcional y retrocompatible: apps/storefront sigue
// llamando a esta función sin él. `localePrefixes` (Fase de i18n): lista de
// prefijos de locale NO por defecto que puedan preceder a protectedPaths
// (p. ej. ["en"] en apps/storefront con next-intl en modo "as-needed", donde
// el locale por defecto no lleva prefijo) — opcional y retrocompatible,
// default [] deja el comportamiento idéntico al de antes de i18n.
export function withAuthGuard({
  protectedPaths,
  requiredRole,
  forbiddenRedirectPath = "/403",
  localePrefixes = [],
}: {
  protectedPaths: string[];
  requiredRole?: UserRole;
  forbiddenRedirectPath?: string;
  localePrefixes?: string[];
}) {
  return auth((req) => {
    const { locale, pathname } = stripLocalePrefix(req.nextUrl.pathname, localePrefixes);
    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
    if (!isProtected) {
      return NextResponse.next();
    }

    const withLocalePrefix = (path: string) => (locale ? `/${locale}${path}` : path);

    if (!req.auth) {
      const loginUrl = new URL(withLocalePrefix("/login"), req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (requiredRole && req.auth.user.role !== requiredRole) {
      return NextResponse.redirect(
        new URL(withLocalePrefix(forbiddenRedirectPath), req.nextUrl.origin),
      );
    }

    return NextResponse.next();
  });
}
