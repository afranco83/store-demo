import { SignJWT } from "jose";
import type { UserRole } from "@store-demo/shared-types";

const JWT_ALGORITHM = "HS256";
const JWT_EXPIRATION = "2h";

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error("AUTH_JWT_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

// Solo firma: nada consume/verifica este token todavía (Fase 5 añadirá el guard).
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
