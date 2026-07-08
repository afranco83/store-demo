import { afterEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@store-demo/testing";

describe("getDemoUserId", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("should resolve to the demo user's id", async () => {
    const { getDemoUserId } = await import("./get-demo-user-id");

    const userId = await getDemoUserId();

    expect(userId).toEqual(expect.any(String));
    expect(userId.length).toBeGreaterThan(0);
  });

  it("should retry after a failed login instead of permanently caching the rejection", async () => {
    const { getDemoUserId } = await import("./get-demo-user-id");

    server.use(
      http.post(
        "*/api/auth/login",
        () => HttpResponse.json({ error: { message: "API unavailable" } }, { status: 500 }),
        { once: true },
      ),
    );

    await expect(getDemoUserId()).rejects.toThrow();
    await expect(getDemoUserId()).resolves.toEqual(expect.any(String));
  });
});
