import { z } from "zod";
import { cartItemWithProductSchema } from "@store-demo/shared-types";
import type { CartItemWithProduct } from "@store-demo/shared-types";
import { fetchJson, fetchVoid } from "./http-client";

export async function getCart({ userId }: { userId: string }): Promise<CartItemWithProduct[]> {
  return fetchJson({
    path: `/api/cart/${userId}`,
    schema: z.array(cartItemWithProductSchema),
    init: { cache: "no-store" },
  });
}

export async function addCartItem({
  userId,
  productId,
  quantity,
}: {
  userId: string;
  productId: string;
  quantity: number;
}): Promise<CartItemWithProduct[]> {
  return fetchJson({
    path: `/api/cart/${userId}`,
    schema: z.array(cartItemWithProductSchema),
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
      cache: "no-store",
    },
  });
}

export async function updateCartItem({
  userId,
  productId,
  quantity,
}: {
  userId: string;
  productId: string;
  quantity: number;
}): Promise<CartItemWithProduct> {
  return fetchJson({
    path: `/api/cart/${userId}/${productId}`,
    schema: cartItemWithProductSchema,
    init: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
      cache: "no-store",
    },
  });
}

export async function removeCartItem({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}): Promise<void> {
  return fetchVoid({
    path: `/api/cart/${userId}/${productId}`,
    init: { method: "DELETE", cache: "no-store" },
  });
}

export async function clearCart({ userId }: { userId: string }): Promise<CartItemWithProduct[]> {
  return fetchJson({
    path: `/api/cart/${userId}`,
    schema: z.array(cartItemWithProductSchema),
    init: { method: "DELETE", cache: "no-store" },
  });
}
