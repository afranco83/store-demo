import { login } from "@store-demo/api-client";

const DEMO_USER_EMAIL = process.env.DEMO_USER_EMAIL ?? "customer1@store-demo.test";
const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD ?? "Password123!";

let cachedUserId: Promise<string> | null = null;

/**
 * No hay auth real hasta la Fase 5: el carrito se persiste contra un único
 * usuario demo seedeado, resuelto vía login() (idempotente entre reseeds
 * normales porque el seed hace upsert por email). Único punto a sustituir
 * cuando exista sesión real.
 */
export function getDemoUserId(): Promise<string> {
  // Si login() falla (p. ej. apps/api tarda en arrancar), no se cachea el
  // rechazo: `??=` solo reasigna cuando cachedUserId es null/undefined, así
  // que sin este catch un único fallo transitorio dejaría el carrito roto
  // hasta reiniciar el proceso.
  cachedUserId ??= login({ email: DEMO_USER_EMAIL, password: DEMO_USER_PASSWORD })
    .then((response) => response.user.id)
    .catch((error: unknown) => {
      cachedUserId = null;
      throw error;
    });

  return cachedUserId;
}
