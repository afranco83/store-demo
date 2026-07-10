"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApiClientError, updateCategory } from "@store-demo/api-client";
import { updateCategorySchema } from "@store-demo/shared-types";
import type { Category, UpdateCategory } from "@store-demo/shared-types";
import { getApiToken } from "@store-demo/auth/get-api-token";

const SLUG_IN_USE_STATUS = 409;

export async function updateCategoryAction({
  slug,
  data,
}: {
  slug: string;
  data: UpdateCategory;
}): Promise<{ error: string } | { category: Category }> {
  const parsed = updateCategorySchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Revisa los datos del formulario." };
  }

  const token = await getApiToken();
  if (!token) {
    redirect("/login");
  }

  try {
    const category = await updateCategory({ token, slug, input: parsed.data });
    revalidatePath("/categories");
    return { category };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === SLUG_IN_USE_STATUS) {
      return { error: "Ya existe una categoría con ese slug." };
    }
    return { error: "No se pudo guardar la categoría. Inténtalo de nuevo." };
  }
}
