import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@store-demo/testing";
import { login } from "./auth.api";
import { ApiClientError } from "./errors";

describe("auth.api", () => {
  it("should return a token and user when credentials are valid", async () => {
    const result = await login({ email: "customer@store-demo.test", password: "Password123!" });

    expect(result).toHaveProperty("token");
    expect(result.user).toHaveProperty("email");
  });

  it("should throw ApiClientError when credentials are invalid", async () => {
    server.use(
      http.post("*/api/auth/login", () => {
        return HttpResponse.json(
          { error: { message: "Invalid email or password" } },
          { status: 401 },
        );
      }),
    );

    await expect(login({ email: "wrong@store-demo.test", password: "wrong" })).rejects.toThrow(
      ApiClientError,
    );
  });
});
