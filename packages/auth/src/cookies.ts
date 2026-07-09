// Cookie httpOnly propia (no gestionada por Auth.js) que guarda el token que
// apps/api ya emite en login/register (signAuthToken, verificable con
// verifyAuthToken) — nunca pasa por el JWT cifrado de Auth.js ni por el
// callback session(), así que nunca se expone a useSession()/al cliente.
export const API_TOKEN_COOKIE = "api_token";

// Ventana corta (7 días, alineada con apps/api, ver jwt.ts) porque no hay
// revocación de tokens: get-api-token.ts la desliza en cada lectura mientras
// la sesión de Auth.js siga activa, así que un usuario activo no la nota.
export const API_TOKEN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type OwnCookieOptions = {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge: number;
};

// Opciones compartidas para cualquier cookie httpOnly propia (no gestionada
// por Auth.js) — api_token aquí, guest_cart_id en apps/storefront — evita
// que las opciones diverjan entre los distintos sitios que fijan una cookie
// de este tipo.
export function ownHttpOnlyCookieOptions(maxAgeSeconds: number): OwnCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
