import { userSchema } from "@store-demo/shared-types";
import type { UpdateProfileRequest, User } from "@store-demo/shared-types";
import { fetchJson } from "./http-client";

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export async function getProfile({ token }: { token: string }): Promise<User> {
  return fetchJson({
    path: "/api/users/me",
    schema: userSchema,
    init: { headers: authHeaders(token), cache: "no-store" },
  });
}

export async function updateProfile({
  token,
  name,
  email,
}: { token: string } & UpdateProfileRequest): Promise<User> {
  return fetchJson({
    path: "/api/users/me",
    schema: userSchema,
    init: {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ name, email }),
      cache: "no-store",
    },
  });
}
