"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { ApiClientError, createOrder } from "@store-demo/api-client";
import { checkoutRequestSchema } from "@store-demo/shared-types";
import type { CheckoutRequest, Order } from "@store-demo/shared-types";
// Import de subpath (no del barrel "@store-demo/auth"): ver el mismo
// comentario en features/account/api/get-profile.action.ts.
import { getApiToken } from "@store-demo/auth/get-api-token";

import { redirect } from "@/i18n/navigation";

const PAYMENT_DECLINED_STATUS = 402;

export async function createOrderAction(
  data: CheckoutRequest,
): Promise<{ error: string } | { order: Order }> {
  const t = await getTranslations("checkout.errors");

  const parsed = checkoutRequestSchema.safeParse(data);
  if (!parsed.success) {
    return { error: t("invalidFormData") };
  }

  const token = await getApiToken();
  if (!token) {
    redirect({ href: "/login", locale: await getLocale() });
    // redirect() siempre lanza (nunca retorna) — el tipo genérico de
    // next-intl no lo resuelve a `never` de forma fiable para el control-flow
    // narrowing de TypeScript, de ahí este throw explícito e inalcanzable en
    // runtime, solo para que `token` se estreche a `string` más abajo.
    throw new Error("unreachable");
  }

  try {
    const order = await createOrder({ token, ...parsed.data });
    return { order };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === PAYMENT_DECLINED_STATUS) {
      return { error: t("paymentDeclined") };
    }
    return { error: t("serviceError") };
  }
}
