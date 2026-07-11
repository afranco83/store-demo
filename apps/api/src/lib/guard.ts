import { GUEST_ID_HEADER } from "@store-demo/shared-types";
import type { UserRole } from "@store-demo/shared-types";
import { jsonError, mapPrismaErrorToResponse } from "./api-response";
import { InvalidAuthTokenError, verifyAuthToken } from "./jwt";

export class UnauthorizedError extends Error {}
export class ForbiddenError extends Error {}

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

// Único punto donde se verifica un token: un token inválido/expirado es,
// para cualquier caller, indistinguible de "sin token" (UnauthorizedError,
// 401) — así ningún Route Handler necesita conocer InvalidAuthTokenError.
async function verifyBearerToken(token: string) {
  try {
    return await verifyAuthToken(token);
  } catch (error) {
    if (error instanceof InvalidAuthTokenError) {
      throw new UnauthorizedError("Invalid or expired session token", { cause: error });
    }
    throw error;
  }
}

// Identidad para el carrito: usuario autenticado (token verificado) o
// invitado (header opaco, sin verificación criptográfica — ver
// ARCHITECTURE.md §4, un carrito de invitado no tiene datos sensibles).
// Nunca se deriva de un userId/guestId que el cliente ponga en la URL o body.
export async function resolveCartIdentity(request: Request): Promise<CartIdentity> {
  const token = getBearerToken(request);
  if (token) {
    const { userId, role } = await verifyBearerToken(token);
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
  return verifyBearerToken(token);
}

// Guard de administración (Fase 7): gestión de catálogo (products/categories)
// nunca se confía al cliente/UI de apps/admin — se verifica siempre el rol
// del token server-side, mismo criterio que requireUser con la identidad.
export async function requireAdmin(request: Request): Promise<{ userId: string; role: UserRole }> {
  const identity = await requireUser(request);
  if (identity.role !== "admin") {
    throw new ForbiddenError("Admin role required");
  }
  return identity;
}

// Cláusula `where` de alcance por propiedad: un admin ve/edita cualquier
// pedido, un customer solo los suyos. Compartida por el listado y el detalle
// de pedidos (antes duplicada en orders/[orderId]/route.ts).
export function scopeByOwnership({ userId, role }: { userId: string; role: UserRole }) {
  return role === "admin" ? {} : { userId };
}

// Construye la cláusula `where` de la clave única compuesta de CartItem
// según el tipo de identidad — el mismo par (userId_productId /
// guestId_productId) que necesitan GET/POST/PATCH/DELETE de cart.
export function cartItemUniqueWhere(identity: CartIdentity, productId: string) {
  return identity.type === "user"
    ? { userId_productId: { userId: identity.userId, productId } }
    : { guestId_productId: { guestId: identity.guestId, productId } };
}

// Único manejador de errores para cualquier Route Handler autenticado
// (cart/orders/users): una identidad ausente o inválida siempre es 401,
// cualquier otro error se mapea igual que el resto de la API (ver
// api-response.ts).
export function handleAuthenticatedRouteError(error: unknown): Response {
  if (error instanceof UnauthorizedError) {
    return jsonError("Unauthorized", 401);
  }
  if (error instanceof ForbiddenError) {
    return jsonError("Forbidden", 403);
  }
  return mapPrismaErrorToResponse(error);
}
