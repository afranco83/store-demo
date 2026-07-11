import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { UserRole } from "@store-demo/shared-types";
import { authConfig } from "./auth.config";

// Instancia de auth() propia para middleware (Edge runtime): usa la config
// edge-safe, nunca la config completa con el Credentials provider.
const { auth } = NextAuth(authConfig);

// Reutilizable desde apps/storefront y apps/admin (Fase 7) para proteger
// prefijos de ruta — redirige a /login con callbackUrl si no hay sesión, y
// opcionalmente exige un rol concreto (apps/admin: solo "admin"), redirigiendo
// a `forbiddenRedirectPath` si la sesión es válida pero el rol no coincide.
// `requiredRole` es opcional y retrocompatible: apps/storefront sigue
// llamando a esta función sin él.
export function withAuthGuard({
  protectedPaths,
  requiredRole,
  forbiddenRedirectPath = "/403",
}: {
  protectedPaths: string[];
  requiredRole?: UserRole;
  forbiddenRedirectPath?: string;
}) {
  return auth((req) => {
    const isProtected = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));
    if (!isProtected) {
      return NextResponse.next();
    }

    if (!req.auth) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (requiredRole && req.auth.user.role !== requiredRole) {
      return NextResponse.redirect(new URL(forbiddenRedirectPath, req.nextUrl.origin));
    }

    return NextResponse.next();
  });
}
