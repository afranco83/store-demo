"use server";

import { redirect } from "next/navigation";
import { getProfile } from "@store-demo/api-client";
import type { User } from "@store-demo/shared-types";
// Import de subpath (no del barrel "@store-demo/auth"): ver el mismo
// comentario en features/cart/lib/get-cart-identity.ts / features/orders.
import { getApiToken } from "@store-demo/auth/get-api-token";

export async function getProfileAction(): Promise<User> {
  const token = await getApiToken();
  if (!token) {
    redirect("/login");
  }
  return getProfile({ token });
}
