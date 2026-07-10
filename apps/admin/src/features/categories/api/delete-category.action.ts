"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApiClientError, deleteCategory } from "@store-demo/api-client";
import { getApiToken } from "@store-demo/auth/get-api-token";

const RELATED_RECORDS_STATUS = 409;

export async function deleteCategoryAction(
  slug: string,
): Promise<{ error: string } | { success: true }> {
  const token = await getApiToken();
  if (!token) {
    redirect("/login");
  }

  try {
    await deleteCategory({ token, slug });
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === RELATED_RECORDS_STATUS) {
      return { error: "No se puede eliminar: hay productos en esta categoría." };
    }
    return { error: "No se pudo eliminar la categoría. Inténtalo de nuevo." };
  }
}
