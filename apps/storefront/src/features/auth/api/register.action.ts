"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { getLocale, getTranslations } from "next-intl/server";
import { ApiClientError, register } from "@store-demo/api-client";
import { signIn } from "@store-demo/auth";
import { registerRequestSchema } from "@store-demo/shared-types";
import type { RegisterRequest } from "@store-demo/shared-types";

import { getPathname } from "@/i18n/navigation";

const EMAIL_IN_USE_STATUS = 409;

export async function registerAction(
  data: RegisterRequest,
): Promise<{ error: string } | undefined> {
  const t = await getTranslations("auth.errors");

  const parsed = registerRequestSchema.safeParse(data);
  if (!parsed.success) {
    return { error: t("invalidFormData") };
  }

  try {
    await register(parsed.data);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === EMAIL_IN_USE_STATUS) {
      return { error: t("emailTaken") };
    }
    return { error: t("registerServiceError") };
  }

  try {
    // Inicia sesión con las mismas credenciales justo después de crear la
    // cuenta (evita duplicar la emisión de sesión en el endpoint de
    // registro, ver ARCHITECTURE.md §4). Reusa el mismo signIn() que login.
    const locale = await getLocale();
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: getPathname({ href: "/account", locale }),
    });
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return { error: t("accountCreatedButLoginFailed") };
    }
    if (error instanceof AuthError) {
      return { error: t("accountCreatedAutoLoginFailed") };
    }
    throw error;
  }
}
