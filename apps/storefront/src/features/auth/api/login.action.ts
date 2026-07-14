"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { getLocale, getTranslations } from "next-intl/server";
import { signIn } from "@store-demo/auth";
import { loginRequestSchema } from "@store-demo/shared-types";
import type { LoginRequest } from "@store-demo/shared-types";

import { getPathname } from "@/i18n/navigation";

export async function loginAction(data: LoginRequest): Promise<{ error: string } | undefined> {
  const t = await getTranslations("auth.errors");

  const parsed = loginRequestSchema.safeParse(data);
  if (!parsed.success) {
    return { error: t("invalidCredentials") };
  }

  try {
    // signIn() redirige internamente a `redirectTo` (no pasa por el
    // middleware/next-intl) — hay que anteponerle el locale activo a mano
    // vía getPathname(), igual que hace next-intl con sus propios <Link>.
    const locale = await getLocale();
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: getPathname({ href: "/account", locale }),
    });
  } catch (error) {
    // signIn() con éxito hace redirect() por dentro, que lanza una señal
    // interna de Next (no un AuthError) — hay que dejarla propagar tal cual
    // para que la navegación ocurra. CredentialsSignin es específicamente
    // "credenciales inválidas" (authorize() devolvió null); cualquier otro
    // AuthError (p.ej. apps/api caída, ver authorize() en packages/auth) es
    // un fallo de servicio, no hay que decirle al usuario que su contraseña
    // está mal.
    if (error instanceof CredentialsSignin) {
      return { error: t("wrongCredentials") };
    }
    if (error instanceof AuthError) {
      return { error: t("loginServiceError") };
    }
    throw error;
  }
}
