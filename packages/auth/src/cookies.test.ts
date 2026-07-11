import { afterEach, describe, expect, it, vi } from "vitest";

import { ownHttpOnlyCookieOptions } from "./cookies";

describe("ownHttpOnlyCookieOptions", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should mark the cookie as secure in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(ownHttpOnlyCookieOptions(60)).toEqual({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60,
    });
  });

  it("should not mark the cookie as secure outside production", () => {
    vi.stubEnv("NODE_ENV", "development");

    expect(ownHttpOnlyCookieOptions(60).secure).toBe(false);
  });
});
