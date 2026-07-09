"use server";

import { redirect } from "next/navigation";
import { getOrders } from "@store-demo/api-client";
import type { Order } from "@store-demo/shared-types";
// Import de subpath (no del barrel "@store-demo/auth"): ver el mismo
// comentario en features/cart/lib/get-cart-identity.ts.
import { getApiToken } from "@store-demo/auth/get-api-token";

export async function getOrdersAction(): Promise<Order[]> {
  const token = await getApiToken();
  if (!token) {
    // Normalmente lo evita middleware.ts, pero la sesión de Auth.js (rolling)
    // y la cookie api_token (ventana propia, ver packages/auth/src/cookies.ts)
    // son dos cookies independientes que en el peor caso pueden desincronizarse
    // — defensa en profundidad real, no solo teórica (AGENTS.md §10): en vez
    // de reventar con un error sin manejar, se degrada igual que el guard de
    // middleware.
    redirect("/login");
  }
  return getOrders({ token });
}
