import { cookies } from "next/headers";
import {
  API_TOKEN_COOKIE,
  API_TOKEN_COOKIE_MAX_AGE_SECONDS,
  ownHttpOnlyCookieOptions,
} from "./cookies";

// Único punto de lectura del token de apps/api para Server Actions/Server
// Components autenticados (features/cart, features/orders) — null si no hay
// sesión, en cuyo caso el llamador debe caer al flujo de invitado. Sin
// `import "server-only"` a propósito: revienta bajo jsdom (ve
// window/document siempre presentes) y este módulo lo ejercitan los tests
// de Vitest+jsdom de features/cart (mismo criterio que get-demo-user-id en
// Fase 4, ver ROADMAP.md).
//
// Desliza el maxAge de la cookie en cada lectura (igual que la sesión JWT de
// Auth.js, que por defecto se renueva con la actividad): sin esto, esta
// cookie de vida corta (7 días, ver cookies.ts) podría caducar antes que una
// sesión de Auth.js todavía activa, dejando a un usuario "logueado" según
// auth() pero tratado como invitado aquí — un usuario activo nunca lo nota,
// solo expira de verdad tras 7 días de inactividad real.
export async function getApiToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(API_TOKEN_COOKIE)?.value;
  if (!token) {
    return null;
  }

  cookieStore.set(
    API_TOKEN_COOKIE,
    token,
    ownHttpOnlyCookieOptions(API_TOKEN_COOKIE_MAX_AGE_SECONDS),
  );
  return token;
}
