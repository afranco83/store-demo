"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApiClientError, createCategory } from "@store-demo/api-client";
import { createCategorySchema } from "@store-demo/shared-types";
import type { Category, CreateCategory } from "@store-demo/shared-types";
import { getApiToken } from "@store-demo/auth/get-api-token";

const SLUG_IN_USE_STATUS = 409;

export async function createCategoryAction(
  data: CreateCategory,
): Promise<{ error: string } | { category: Category }> {
  const parsed = createCategorySchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Revisa los datos del formulario." };
  }

  const token = await getApiToken();
  if (!token) {
    redirect("/login");
  }

  try {
    const category = await createCategory({ token, input: parsed.data });
    revalidatePath("/categories");
    return { category };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === SLUG_IN_USE_STATUS) {
      return { error: "Ya existe una categoría con ese slug." };
    }
    return { error: "No se pudo crear la categoría. Inténtalo de nuevo." };
  }
}
