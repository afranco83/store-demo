"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateOrderStatus } from "@store-demo/api-client";
import { updateOrderStatusSchema } from "@store-demo/shared-types";
import type { Order, OrderStatus } from "@store-demo/shared-types";
import { getApiToken } from "@store-demo/auth/get-api-token";

export async function updateOrderStatusAction({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}): Promise<{ error: string } | { order: Order }> {
  const parsed = updateOrderStatusSchema.safeParse({ status });
  if (!parsed.success) {
    return { error: "Estado de pedido no válido." };
  }

  const token = await getApiToken();
  if (!token) {
    redirect("/login");
  }

  try {
    const order = await updateOrderStatus({ token, orderId, status: parsed.data.status });
    revalidatePath("/orders");
    return { order };
  } catch {
    return { error: "No se pudo actualizar el estado del pedido. Inténtalo de nuevo." };
  }
}
