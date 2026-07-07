import { z } from "zod";
import { categorySchema } from "@store-demo/shared-types";
import type { Category, CreateCategory, UpdateCategory } from "@store-demo/shared-types";
import { fetchJson, fetchVoid } from "./http-client";

export async function getCategories(): Promise<Category[]> {
  return fetchJson({
    path: "/api/categories",
    schema: z.array(categorySchema),
    init: { next: { revalidate: 60 } },
  });
}

export async function getCategoryBySlug({ slug }: { slug: string }): Promise<Category> {
  return fetchJson({
    path: `/api/categories/${slug}`,
    schema: categorySchema,
    init: { next: { revalidate: 60 } },
  });
}

export async function createCategory(input: CreateCategory): Promise<Category> {
  return fetchJson({
    path: "/api/categories",
    schema: categorySchema,
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    },
  });
}

export async function updateCategory({
  slug,
  input,
}: {
  slug: string;
  input: UpdateCategory;
}): Promise<Category> {
  return fetchJson({
    path: `/api/categories/${slug}`,
    schema: categorySchema,
    init: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    },
  });
}

export async function deleteCategory({ slug }: { slug: string }): Promise<void> {
  return fetchVoid({
    path: `/api/categories/${slug}`,
    init: { method: "DELETE", cache: "no-store" },
  });
}
