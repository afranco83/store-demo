import { z } from "zod";
import { GUEST_ID_HEADER, cartItemWithProductSchema } from "@store-demo/shared-types";
import type { CartItemWithProduct } from "@store-demo/shared-types";
import { fetchJson, fetchVoid } from "./http-client";

// Identidad del carrito: un usuario autenticado manda el token de sesión
// (verificado en apps/api), un invitado manda su id opaco de invitado. Nunca
// se manda un userId explícito en el payload (Fase 5, ver ARCHITECTURE.md §4).
export type CartIdentity = { token: string } | { guestId: string };

function identityHeaders(identity: CartIdentity): Record<string, string> {
  return "token" in identity
    ? { Authorization: `Bearer ${identity.token}` }
    : { [GUEST_ID_HEADER]: identity.guestId };
}

export async function getCart({
  identity,
}: {
  identity: CartIdentity;
}): Promise<CartItemWithProduct[]> {
  return fetchJson({
    path: "/api/cart",
    schema: z.array(cartItemWithProductSchema),
    init: { headers: identityHeaders(identity), cache: "no-store" },
  });
}

export async function addCartItem({
  identity,
  productId,
  quantity,
}: {
  identity: CartIdentity;
  productId: string;
  quantity: number;
}): Promise<CartItemWithProduct[]> {
  return fetchJson({
    path: "/api/cart",
    schema: z.array(cartItemWithProductSchema),
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json", ...identityHeaders(identity) },
      body: JSON.stringify({ productId, quantity }),
      cache: "no-store",
    },
  });
}

export async function updateCartItem({
  identity,
  productId,
  quantity,
}: {
  identity: CartIdentity;
  productId: string;
  quantity: number;
}): Promise<CartItemWithProduct> {
  return fetchJson({
    path: `/api/cart/${productId}`,
    schema: cartItemWithProductSchema,
    init: {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...identityHeaders(identity) },
      body: JSON.stringify({ quantity }),
      cache: "no-store",
    },
  });
}

export async function removeCartItem({
  identity,
  productId,
}: {
  identity: CartIdentity;
  productId: string;
}): Promise<void> {
  return fetchVoid({
    path: `/api/cart/${productId}`,
    init: { method: "DELETE", headers: identityHeaders(identity), cache: "no-store" },
  });
}

export async function clearCart({
  identity,
}: {
  identity: CartIdentity;
}): Promise<CartItemWithProduct[]> {
  return fetchJson({
    path: "/api/cart",
    schema: z.array(cartItemWithProductSchema),
    init: { method: "DELETE", headers: identityHeaders(identity), cache: "no-store" },
  });
}

// Fusiona el carrito de invitado dentro del carrito del usuario que acaba de
// iniciar sesión — se llama una vez, desde el callback signIn de packages/auth.
export async function mergeGuestCart({
  token,
  guestId,
}: {
  token: string;
  guestId: string;
}): Promise<CartItemWithProduct[]> {
  return fetchJson({
    path: "/api/cart/merge",
    schema: z.array(cartItemWithProductSchema),
    init: {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, [GUEST_ID_HEADER]: guestId },
      cache: "no-store",
    },
  });
}
