import { jwtVerify, SignJWT } from "jose";
import { userRoleSchema } from "@store-demo/shared-types";
import type { UserRole } from "@store-demo/shared-types";

const JWT_ALGORITHM = "HS256";
// Ventana de expiración corta (7 días) porque no hay revocación/blacklist de
// tokens: es la única forma de acotar cuánto tiempo sigue siendo válido un
// token filtrado o usado tras logout. `packages/auth` (get-api-token.ts)
// desliza la cookie httpOnly que guarda este token con el mismo maxAge en
// cada lectura mientras la sesión de Auth.js siga activa, así que un usuario
// activo no nota la expiración — solo se aplica a sesiones realmente
// inactivas. Sin refresh-token rotation: simplificación deliberada,
// razonable para un proyecto demo.
const JWT_EXPIRATION = "7d";

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error("AUTH_JWT_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function signAuthToken({
  userId,
  role,
}: {
  userId: string;
  role: UserRole;
}): Promise<string> {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(getJwtSecretKey());
}

export type AuthTokenPayload = {
  userId: string;
  role: UserRole;
};

export class InvalidAuthTokenError extends Error {}

// Única fuente de verdad de identidad para mutaciones autenticadas
// (cart/orders, Fase 5): nunca se confía en un userId que venga en la URL,
// query o body, siempre se deriva de un token firmado y verificado aquí.
export async function verifyAuthToken(token: string): Promise<AuthTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      algorithms: [JWT_ALGORITHM],
    });
    if (typeof payload.sub !== "string") {
      throw new InvalidAuthTokenError("Token is missing a subject claim");
    }
    return {
      userId: payload.sub,
      role: userRoleSchema.parse(payload.role),
    };
  } catch (cause) {
    throw new InvalidAuthTokenError("Invalid or expired auth token", { cause });
  }
}
