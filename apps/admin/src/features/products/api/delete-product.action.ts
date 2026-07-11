"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApiClientError, deleteProduct } from "@store-demo/api-client";
import { getApiToken } from "@store-demo/auth/get-api-token";

const RELATED_RECORDS_STATUS = 409;

export async function deleteProductAction(
  slug: string,
): Promise<{ error: string } | { success: true }> {
  const token = await getApiToken();
  if (!token) {
    redirect("/login");
  }

  try {
    await deleteProduct({ token, slug });
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === RELATED_RECORDS_STATUS) {
      return { error: "No se puede eliminar: hay pedidos o carritos que lo referencian." };
    }
    return { error: "No se pudo eliminar el producto. Inténtalo de nuevo." };
  }
}
