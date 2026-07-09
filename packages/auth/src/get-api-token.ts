import { cookies } from "next/headers";
import { API_TOKEN_COOKIE } from "./cookies";

// Único punto de lectura del token de apps/api para Server Actions/Server
// Components autenticados (features/cart, features/orders) — null si no hay
// sesión, en cuyo caso el llamador debe caer al flujo de invitado. Sin
// `import "server-only"` a propósito: revienta bajo jsdom (ve
// window/document siempre presentes) y este módulo lo ejercitan los tests
// de Vitest+jsdom de features/cart (mismo criterio que get-demo-user-id en
// Fase 4, ver ROADMAP.md).
export async function getApiToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(API_TOKEN_COOKIE)?.value ?? null;
}
