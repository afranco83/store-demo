"use server";

import { getOrders } from "@store-demo/api-client";
import type { Order } from "@store-demo/shared-types";
// Import de subpath (no del barrel "@store-demo/auth"): ver el mismo
// comentario en features/cart/lib/get-cart-identity.ts.
import { getApiToken } from "@store-demo/auth/get-api-token";

export async function getOrdersAction(): Promise<Order[]> {
  const token = await getApiToken();
  if (!token) {
    // No debería alcanzarse: middleware.ts ya redirige a /login si no hay
    // sesión antes de renderizar esta página (defensa en profundidad, ver
    // AGENTS.md §10).
    throw new Error("No active session");
  }
  return getOrders({ token });
}
