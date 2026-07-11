"use server";

import { redirect } from "next/navigation";
import { getOrders } from "@store-demo/api-client";
import type { Order } from "@store-demo/shared-types";
import { getApiToken } from "@store-demo/auth/get-api-token";

// El propio Route Handler GET /api/orders devuelve todos los pedidos cuando
// el rol del token es "admin" (scopeByOwnership, ver apps/api/src/lib/guard.ts)
// — no hace falta una función/endpoint distinto para el listado de admin.
export async function getOrdersAction(): Promise<Order[]> {
  const token = await getApiToken();
  if (!token) {
    redirect("/login");
  }
  return getOrders({ token });
}
