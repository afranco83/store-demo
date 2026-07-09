"use server";

import { redirect } from "next/navigation";
import { ApiClientError, updateProfile } from "@store-demo/api-client";
import { updateProfileRequestSchema } from "@store-demo/shared-types";
import type { UpdateProfileRequest, User } from "@store-demo/shared-types";
import { getApiToken } from "@store-demo/auth/get-api-token";

const EMAIL_IN_USE_STATUS = 409;

export async function updateProfileAction(
  data: UpdateProfileRequest,
): Promise<{ error: string } | { user: User }> {
  const parsed = updateProfileRequestSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Revisa los datos del formulario." };
  }

  const token = await getApiToken();
  if (!token) {
    redirect("/login");
  }

  try {
    const user = await updateProfile({ token, ...parsed.data });
    return { user };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === EMAIL_IN_USE_STATUS) {
      return { error: "Ese email ya está en uso." };
    }
    return { error: "No se pudieron guardar los cambios. Inténtalo de nuevo." };
  }
}
