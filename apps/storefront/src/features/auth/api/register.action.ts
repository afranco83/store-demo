"use server";

import { AuthError } from "next-auth";
import { ApiClientError, register } from "@store-demo/api-client";
import { signIn } from "@store-demo/auth";
import { registerRequestSchema } from "@store-demo/shared-types";
import type { RegisterRequest } from "@store-demo/shared-types";

export async function registerAction(
  data: RegisterRequest,
): Promise<{ error: string } | undefined> {
  const parsed = registerRequestSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Revisa los datos del formulario." };
  }

  try {
    await register(parsed.data);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 409) {
      return { error: "Ya existe una cuenta con ese email." };
    }
    return { error: "No se pudo completar el registro. Inténtalo de nuevo." };
  }

  try {
    // Inicia sesión con las mismas credenciales justo después de crear la
    // cuenta (evita duplicar la emisión de sesión en el endpoint de
    // registro, ver ARCHITECTURE.md §4). Reusa el mismo signIn() que login.
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/account",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Cuenta creada. Inicia sesión para continuar." };
    }
    throw error;
  }
}
