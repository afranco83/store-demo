import { beforeAll, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";

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

  beforeAll(async () => {
    process.env.AUTH_JWT_SECRET = "test-secret";
    customerUserId = faker.string.uuid();
    adminUserId = faker.string.uuid();
    customerToken = await signAuthToken({ userId: customerUserId, role: "customer" });
    adminToken = await signAuthToken({ userId: adminUserId, role: "admin" });
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
