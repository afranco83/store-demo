import { GUEST_ID_HEADER } from "@store-demo/shared-types";
import type { UserRole } from "@store-demo/shared-types";
import { verifyAuthToken } from "./jwt";

export class UnauthorizedError extends Error {}

export type CartIdentity =
  { type: "user"; userId: string; role: UserRole } | { type: "guest"; guestId: string };

function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

// Identidad para el carrito: usuario autenticado (token verificado) o
// invitado (header opaco, sin verificación criptográfica — ver
// ARCHITECTURE.md §4, un carrito de invitado no tiene datos sensibles).
// Nunca se deriva de un userId/guestId que el cliente ponga en la URL o body.
export async function resolveCartIdentity(request: Request): Promise<CartIdentity> {
  const token = getBearerToken(request);
  if (token) {
    const { userId, role } = await verifyAuthToken(token);
    return { type: "user", userId, role };
  }

  const guestId = request.headers.get(GUEST_ID_HEADER);
  if (guestId) {
    return { type: "guest", guestId };
  }

  throw new UnauthorizedError("Missing session token or guest id");
}

// Identidad para pedidos: siempre un usuario autenticado, nunca invitado
// (el checkout exige login, ver ROADMAP.md Fase 5/6).
export async function requireUser(request: Request): Promise<{ userId: string; role: UserRole }> {
  const token = getBearerToken(request);
  if (!token) {
    throw new UnauthorizedError("Missing session token");
  }
  return verifyAuthToken(token);
}
