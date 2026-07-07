import { loginResponseSchema } from "@store-demo/shared-types";
import type { LoginResponse } from "@store-demo/shared-types";
import { fetchJson } from "./http-client";

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  return fetchJson({
    path: "/api/auth/login",
    schema: loginResponseSchema,
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    },
  });
}
