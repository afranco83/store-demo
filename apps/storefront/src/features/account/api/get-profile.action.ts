"use server";

import { getLocale } from "next-intl/server";
import { getProfile } from "@store-demo/api-client";
import type { User } from "@store-demo/shared-types";
// Import de subpath (no del barrel "@store-demo/auth"): ver el mismo
// comentario en features/cart/lib/get-cart-identity.ts / features/orders.
import { getApiToken } from "@store-demo/auth/get-api-token";

import { redirect } from "@/i18n/navigation";

export async function getProfileAction(): Promise<User> {
  const token = await getApiToken();
  if (!token) {
    return redirect({ href: "/login", locale: await getLocale() });
  }
  return getProfile({ token });
}
