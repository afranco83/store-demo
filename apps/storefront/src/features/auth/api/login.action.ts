"use server";

import { AuthError, CredentialsSignin } from "next-auth";
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
    // para que la navegación ocurra. CredentialsSignin es específicamente
    // "credenciales inválidas" (authorize() devolvió null); cualquier otro
    // AuthError (p.ej. apps/api caída, ver authorize() en packages/auth) es
    // un fallo de servicio, no hay que decirle al usuario que su contraseña
    // está mal.
    if (error instanceof CredentialsSignin) {
      return { error: "Email o contraseña incorrectos." };
    }
    if (error instanceof AuthError) {
      return { error: "No se pudo iniciar sesión. Inténtalo de nuevo en unos minutos." };
    }
    throw error;
  }
}
