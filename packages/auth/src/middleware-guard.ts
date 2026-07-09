import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

// Instancia de auth() propia para middleware (Edge runtime): usa la config
// edge-safe, nunca la config completa con el Credentials provider.
const { auth } = NextAuth(authConfig);

// Reutilizable desde apps/storefront (y futuro apps/admin, Fase 7) para
// proteger prefijos de ruta — redirige a /login con callbackUrl si no hay
// sesión.
export function withAuthGuard({ protectedPaths }: { protectedPaths: string[] }) {
  return auth((req) => {
    const isProtected = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));
    if (isProtected && !req.auth) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  });
}
