// Cookie httpOnly propia (no gestionada por Auth.js) que guarda el token que
// apps/api ya emite en login/register (signAuthToken, verificable con
// verifyAuthToken) — nunca pasa por el JWT cifrado de Auth.js ni por el
// callback session(), así que nunca se expone a useSession()/al cliente.
export const API_TOKEN_COOKIE = "api_token";

export const API_TOKEN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 días, alineado con apps/api (ver jwt.ts)
