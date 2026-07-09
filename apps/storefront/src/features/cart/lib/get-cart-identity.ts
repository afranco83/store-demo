import { cookies } from "next/headers";
// Import de subpath deliberado (no del barrel "@store-demo/auth"): el
// barrel reexporta también ./config, que carga next-auth entero
// (Credentials provider incluido) — y next-auth importa "next/server" de
// una forma que Vite/Vitest no resuelve bien (ver packages/auth/package.json
// "exports"). getApiToken no necesita nada de eso, solo next/headers.
import { getApiToken } from "@store-demo/auth/get-api-token";
import { GUEST_CART_COOKIE } from "@store-demo/shared-types";
import type { CartIdentity } from "@store-demo/api-client";

const GUEST_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

// Único punto de resolución de identidad para el carrito (Fase 5, sustituye
// al usuario demo de la Fase 4): usuario autenticado -> token de sesión de
// apps/api; invitado -> id opaco en cookie httpOnly propia, creado la
// primera vez que hace falta. Solo se llama desde Server Actions (necesita
// poder escribir cookies, no solo leerlas).
export async function getCartIdentity(): Promise<CartIdentity> {
  const token = await getApiToken();
  if (token) {
    return { token };
  }

  const cookieStore = await cookies();
  const existingGuestId = cookieStore.get(GUEST_CART_COOKIE)?.value;
  if (existingGuestId) {
    return { guestId: existingGuestId };
  }

  const guestId = crypto.randomUUID();
  cookieStore.set(GUEST_CART_COOKIE, guestId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: GUEST_COOKIE_MAX_AGE_SECONDS,
  });
  return { guestId };
}
