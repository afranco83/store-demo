import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@store-demo/testing";
import { getProfile, updateProfile } from "./users.api";
import { ApiClientError } from "./errors";

const token = "fake-jwt-token";

describe("users.api", () => {
  it("should return the authenticated user's profile", async () => {
    const profile = await getProfile({ token });

    expect(profile).toHaveProperty("email");
  });

  it("should update the profile and return the updated user", async () => {
    const profile = await updateProfile({ token, name: "New Name", email: "new@store-demo.test" });

    expect(profile).toHaveProperty("email");
  });

  it("should throw ApiClientError when the email is already in use", async () => {
    server.use(
      http.patch("*/api/users/me", () => {
        return HttpResponse.json(
          { error: { message: "A resource with this value already exists" } },
          { status: 409 },
        );
      }),
    );

    await expect(
      updateProfile({ token, name: "New Name", email: "taken@store-demo.test" }),
    ).rejects.toThrow(ApiClientError);
  });
});
