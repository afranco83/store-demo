import { beforeAll, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import { SignJWT } from "jose";

import { signAuthToken } from "./jwt";
import {
  cartItemUniqueWhere,
  ForbiddenError,
  handleAuthenticatedRouteError,
  requireAdmin,
  requireUser,
  resolveCartIdentity,
  scopeByOwnership,
  UnauthorizedError,
} from "./guard";

function buildRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/orders", { headers });
}

describe("guard", () => {
  let customerToken: string;
  let adminToken: string;
  let customerUserId: string;
  let adminUserId: string;
  // Token con la forma real de un JWT (header.payload.signature), firmado
  // con una clave distinta a AUTH_JWT_SECRET — a diferencia de un string que
  // ni siquiera parsea como JWT, esto ejercita de verdad la rama de fallo de
  // verificación de firma (InvalidAuthTokenError) que causó el bug real de
  // autorización de la Fase 5 (ver docs/ROADMAP.md).
  let tamperedToken: string;

  beforeAll(async () => {
    process.env.AUTH_JWT_SECRET = "test-secret";
    customerUserId = faker.string.uuid();
    adminUserId = faker.string.uuid();
    customerToken = await signAuthToken({ userId: customerUserId, role: "customer" });
    adminToken = await signAuthToken({ userId: adminUserId, role: "admin" });
    tamperedToken = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(adminUserId)
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode("a-different-secret"));
  });

  describe("resolveCartIdentity", () => {
    it("should resolve a user identity from a valid bearer token", async () => {
      const request = buildRequest({ authorization: `Bearer ${customerToken}` });

      await expect(resolveCartIdentity(request)).resolves.toEqual({
        type: "user",
        userId: customerUserId,
        role: "customer",
      });
    });

    it("should resolve a guest identity from the guest id header when there is no token", async () => {
      const guestId = faker.string.uuid();
      const request = buildRequest({ "x-guest-id": guestId });

      await expect(resolveCartIdentity(request)).resolves.toEqual({ type: "guest", guestId });
    });

    it("should throw UnauthorizedError when neither a token nor a guest id is present", async () => {
      await expect(resolveCartIdentity(buildRequest())).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError for an invalid bearer token", async () => {
      const request = buildRequest({ authorization: "Bearer not-a-real-token" });

      await expect(resolveCartIdentity(request)).rejects.toThrow(UnauthorizedError);
    });

    it("should resolve the user identity from the token when both a token and a guest id are present", async () => {
      // Caso real: un carrito de invitado que se fusiona al iniciar sesión
      // puede seguir mandando la cookie/header de invitado obsoleto junto al
      // token nuevo — el token siempre gana, nunca se deriva del guestId si
      // hay una sesión válida.
      const guestId = faker.string.uuid();
      const request = buildRequest({
        authorization: `Bearer ${customerToken}`,
        "x-guest-id": guestId,
      });

      await expect(resolveCartIdentity(request)).resolves.toEqual({
        type: "user",
        userId: customerUserId,
        role: "customer",
      });
    });
  });

  describe("requireUser", () => {
    it("should return the identity for a valid bearer token", async () => {
      const request = buildRequest({ authorization: `Bearer ${customerToken}` });

      await expect(requireUser(request)).resolves.toEqual({
        userId: customerUserId,
        role: "customer",
      });
    });

    it("should throw UnauthorizedError when there is no bearer token", async () => {
      await expect(requireUser(buildRequest())).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError, not an unwrapped error, for a well-formed token with an invalid signature", async () => {
      const request = buildRequest({ authorization: `Bearer ${tamperedToken}` });

      await expect(requireUser(request)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("requireAdmin", () => {
    it("should return the identity when the token belongs to an admin", async () => {
      const request = buildRequest({ authorization: `Bearer ${adminToken}` });

      await expect(requireAdmin(request)).resolves.toEqual({ userId: adminUserId, role: "admin" });
    });

    it("should throw ForbiddenError when the token belongs to a non-admin user", async () => {
      const request = buildRequest({ authorization: `Bearer ${customerToken}` });

      await expect(requireAdmin(request)).rejects.toThrow(ForbiddenError);
    });

    it("should throw UnauthorizedError, not ForbiddenError, for a well-formed token with an invalid signature", async () => {
      // Regresión real de la Fase 5: un token manipulado/con firma inválida
      // debe rechazarse como 401 (identidad no verificada), nunca colarse
      // hasta el chequeo de rol y devolver 403 o, peor, un 500 sin envolver.
      const request = buildRequest({ authorization: `Bearer ${tamperedToken}` });

      await expect(requireAdmin(request)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("scopeByOwnership", () => {
    it("should scope to the given userId for a customer", () => {
      expect(scopeByOwnership({ userId: customerUserId, role: "customer" })).toEqual({
        userId: customerUserId,
      });
    });

    it("should not scope at all for an admin", () => {
      expect(scopeByOwnership({ userId: adminUserId, role: "admin" })).toEqual({});
    });
  });

  describe("cartItemUniqueWhere", () => {
    it("should build the userId_productId key for a user identity", () => {
      const productId = faker.string.uuid();

      expect(
        cartItemUniqueWhere({ type: "user", userId: customerUserId, role: "customer" }, productId),
      ).toEqual({ userId_productId: { userId: customerUserId, productId } });
    });

    it("should build the guestId_productId key for a guest identity", () => {
      const guestId = faker.string.uuid();
      const productId = faker.string.uuid();

      expect(cartItemUniqueWhere({ type: "guest", guestId }, productId)).toEqual({
        guestId_productId: { guestId, productId },
      });
    });
  });

  describe("handleAuthenticatedRouteError", () => {
    it("should map UnauthorizedError to a 401 response", async () => {
      const response = handleAuthenticatedRouteError(new UnauthorizedError("no token"));

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: { message: "Unauthorized" } });
    });

    it("should map ForbiddenError to a 403 response", async () => {
      const response = handleAuthenticatedRouteError(new ForbiddenError("admin only"));

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ error: { message: "Forbidden" } });
    });

    it("should map any other error to a 500 response", async () => {
      const response = handleAuthenticatedRouteError(new Error("unexpected"));

      expect(response.status).toBe(500);
    });
  });
});
