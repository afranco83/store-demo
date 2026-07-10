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

export async function createProduct({
  token,
  input,
}: {
  token: string;
  input: CreateProduct;
}): Promise<Product> {
  return fetchJson({
    path: "/api/products",
    schema: productSchema,
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
      cache: "no-store",
    },
  });
}

export async function updateProduct({
  token,
  slug,
  input,
}: {
  token: string;
  slug: string;
  input: UpdateProduct;
}): Promise<Product> {
  return fetchJson({
    path: `/api/products/${slug}`,
    schema: productSchema,
    init: {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
      cache: "no-store",
    },
  });
}

export async function deleteProduct({
  token,
  slug,
}: {
  token: string;
  slug: string;
}): Promise<void> {
  return fetchVoid({
    path: `/api/products/${slug}`,
    init: { method: "DELETE", headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  });
}
