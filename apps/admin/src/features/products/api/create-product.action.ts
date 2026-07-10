"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApiClientError, createProduct } from "@store-demo/api-client";
import { createProductSchema } from "@store-demo/shared-types";
import type { CreateProduct, Product } from "@store-demo/shared-types";
import { getApiToken } from "@store-demo/auth/get-api-token";

const SLUG_IN_USE_STATUS = 409;

export async function createProductAction(
  data: CreateProduct,
): Promise<{ error: string } | { product: Product }> {
  const parsed = createProductSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Revisa los datos del formulario." };
  }

  const token = await getApiToken();
  if (!token) {
    redirect("/login");
  }

  try {
    const product = await createProduct({ token, input: parsed.data });
    revalidatePath("/products");
    return { product };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === SLUG_IN_USE_STATUS) {
      return { error: "Ya existe un producto con ese slug." };
    }
    return { error: "No se pudo crear el producto. Inténtalo de nuevo." };
  }
}
