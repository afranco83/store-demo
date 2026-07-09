import { loginResponseSchema, registerResponseSchema } from "@store-demo/shared-types";
import type { LoginResponse, RegisterResponse } from "@store-demo/shared-types";
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

export async function register({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}): Promise<RegisterResponse> {
  return fetchJson({
    path: "/api/auth/register",
    schema: registerResponseSchema,
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
      cache: "no-store",
    },
  });
}
