import { describe, expect, it } from "vitest";
import { cookies } from "next/headers";
import { GUEST_CART_COOKIE } from "@store-demo/shared-types";

import { getCartIdentity } from "./get-cart-identity";

// "api_token" es el nombre real de la cookie (packages/auth/src/cookies.ts,
// API_TOKEN_COOKIE) — se hardcodea aquí en vez de añadir un subpath de
// exports solo para el test.
const API_TOKEN_COOKIE = "api_token";

describe("getCartIdentity", () => {
  it("should resolve to the session token when there is an active session", async () => {
    const cookieStore = await cookies();
    cookieStore.set(API_TOKEN_COOKIE, "session-token");

    await expect(getCartIdentity()).resolves.toEqual({ token: "session-token" });
  });

  it("should resolve to the existing guest id when there is no session", async () => {
    const cookieStore = await cookies();
    cookieStore.set(GUEST_CART_COOKIE, "existing-guest-id");

    await expect(getCartIdentity()).resolves.toEqual({ guestId: "existing-guest-id" });
  });

  it("should create and persist a new guest id when there is neither session nor guest cookie", async () => {
    const identity = await getCartIdentity();

    expect(identity).toEqual({ guestId: expect.any(String) });

    const cookieStore = await cookies();
    expect(cookieStore.get(GUEST_CART_COOKIE)?.value).toEqual(
      (identity as { guestId: string }).guestId,
    );
  });
});
