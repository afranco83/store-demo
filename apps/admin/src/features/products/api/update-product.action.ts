"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApiClientError, updateProduct } from "@store-demo/api-client";
import { updateProductSchema } from "@store-demo/shared-types";
import type { Product, UpdateProduct } from "@store-demo/shared-types";
import { getApiToken } from "@store-demo/auth/get-api-token";

const SLUG_IN_USE_STATUS = 409;

export async function updateProductAction({
  slug,
  data,
}: {
  slug: string;
  data: UpdateProduct;
}): Promise<{ error: string } | { product: Product }> {
  const parsed = updateProductSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Revisa los datos del formulario." };
  }

  const token = await getApiToken();
  if (!token) {
    redirect("/login");
  }

  try {
    const product = await updateProduct({ token, slug, input: parsed.data });
    revalidatePath("/products");
    return { product };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === SLUG_IN_USE_STATUS) {
      return { error: "Ya existe un producto con ese slug." };
    }
    return { error: "No se pudo guardar el producto. Inténtalo de nuevo." };
  }
}
