"use server";

import { AuthError } from "next-auth";
import { signIn } from "@store-demo/auth";
import { loginRequestSchema } from "@store-demo/shared-types";
import type { LoginRequest } from "@store-demo/shared-types";

export async function loginAction(data: LoginRequest): Promise<{ error: string } | undefined> {
  const parsed = loginRequestSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Introduce un email y una contraseña válidos." };
  }

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/account" });
  } catch (error) {
    // signIn() con éxito hace redirect() por dentro, que lanza una señal
    // interna de Next (no un AuthError) — hay que dejarla propagar tal cual
    // para que la navegación ocurra; solo las credenciales inválidas deben
    // convertirse en un error de formulario.
    if (error instanceof AuthError) {
      return { error: "Email o contraseña incorrectos." };
    }
    throw error;
  }
}
