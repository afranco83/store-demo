"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { ApiClientError, updateProfile } from "@store-demo/api-client";
import { updateProfileRequestSchema } from "@store-demo/shared-types";
import type { UpdateProfileRequest, User } from "@store-demo/shared-types";
import { getApiToken } from "@store-demo/auth/get-api-token";

import { redirect } from "@/i18n/navigation";

const EMAIL_IN_USE_STATUS = 409;

export async function updateProfileAction(
  data: UpdateProfileRequest,
): Promise<{ error: string } | { user: User }> {
  const t = await getTranslations("account.errors");

  const parsed = updateProfileRequestSchema.safeParse(data);
  if (!parsed.success) {
    return { error: t("invalidFormData") };
  }

  const token = await getApiToken();
  if (!token) {
    redirect({ href: "/login", locale: await getLocale() });
    // redirect() siempre lanza (nunca retorna) — el tipo genérico de
    // next-intl no lo resuelve a `never` de forma fiable para el control-flow
    // narrowing de TypeScript, de ahí este throw explícito e inalcanzable en
    // runtime, solo para que `token` se estreche a `string` más abajo.
    throw new Error("unreachable");
  }

  try {
    const user = await updateProfile({ token, ...parsed.data });
    return { user };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === EMAIL_IN_USE_STATUS) {
      return { error: t("emailInUse") };
    }
    return { error: t("serviceError") };
  }
}
