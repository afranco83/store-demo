"use server";

import { redirect } from "next/navigation";
import { ApiClientError, createOrder } from "@store-demo/api-client";
import { checkoutRequestSchema } from "@store-demo/shared-types";
import type { CheckoutRequest, Order } from "@store-demo/shared-types";
// Import de subpath (no del barrel "@store-demo/auth"): ver el mismo
// comentario en features/account/api/get-profile.action.ts.
import { getApiToken } from "@store-demo/auth/get-api-token";

const PAYMENT_DECLINED_STATUS = 402;

export async function createOrderAction(
  data: CheckoutRequest,
): Promise<{ error: string } | { order: Order }> {
  const parsed = checkoutRequestSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Revisa los datos del formulario." };
  }

  const token = await getApiToken();
  if (!token) {
    redirect("/login");
  }

  try {
    const order = await createOrder({ token, ...parsed.data });
    return { order };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === PAYMENT_DECLINED_STATUS) {
      return { error: "Pago rechazado. Comprueba los datos de tu tarjeta e inténtalo de nuevo." };
    }
    return { error: "No se pudo completar el pedido. Inténtalo de nuevo." };
  }
}
