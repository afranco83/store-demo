import { notFound } from "next/navigation";
import { ApiClientError } from "@store-demo/api-client";

// 3ª aparición real del mismo patrón (apps/storefront's product detail page,
// apps/admin's product/category edit pages, Fase 8) — extraído aquí siguiendo
// el criterio AHA de AGENTS.md §1.9 ("se extrae en la 3ª aparición, no antes").
export async function fetchOrNotFound<T>(promise: Promise<T>): Promise<T> {
  return promise.catch((error: unknown) => {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  });
}
