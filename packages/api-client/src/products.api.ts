import { z } from "zod";
import { productSchema } from "@store-demo/shared-types";
import type { Product, CreateProduct, UpdateProduct } from "@store-demo/shared-types";
import { fetchJson, fetchVoid } from "./http-client";

export async function getProducts({ categorySlug }: { categorySlug?: string } = {}): Promise<
  Product[]
> {
  const query = categorySlug ? `?categorySlug=${encodeURIComponent(categorySlug)}` : "";
  return fetchJson({
    path: `/api/products${query}`,
    schema: z.array(productSchema),
    init: { next: { revalidate: 60 } },
  });
}

export async function getProductBySlug({ slug }: { slug: string }): Promise<Product> {
  return fetchJson({
    path: `/api/products/${slug}`,
    schema: productSchema,
    init: { next: { revalidate: 60 } },
  });
}

export async function createProduct(input: CreateProduct): Promise<Product> {
  return fetchJson({
    path: "/api/products",
    schema: productSchema,
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    },
  });
}

export async function updateProduct({
  slug,
  input,
}: {
  slug: string;
  input: UpdateProduct;
}): Promise<Product> {
  return fetchJson({
    path: `/api/products/${slug}`,
    schema: productSchema,
    init: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    },
  });
}

export async function deleteProduct({ slug }: { slug: string }): Promise<void> {
  return fetchVoid({
    path: `/api/products/${slug}`,
    init: { method: "DELETE", cache: "no-store" },
  });
}
