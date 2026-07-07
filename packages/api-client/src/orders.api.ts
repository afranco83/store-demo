import { z } from "zod";
import { orderSchema } from "@store-demo/shared-types";
import type { Order, OrderStatus } from "@store-demo/shared-types";
import { fetchJson } from "./http-client";

export async function getOrders({ userId }: { userId: string }): Promise<Order[]> {
  return fetchJson({
    path: `/api/orders/${userId}`,
    schema: z.array(orderSchema),
    init: { cache: "no-store" },
  });
}

export async function getOrderById({
  userId,
  orderId,
}: {
  userId: string;
  orderId: string;
}): Promise<Order> {
  return fetchJson({
    path: `/api/orders/${userId}/${orderId}`,
    schema: orderSchema,
    init: { cache: "no-store" },
  });
}

export async function createOrder({ userId }: { userId: string }): Promise<Order> {
  return fetchJson({
    path: `/api/orders/${userId}`,
    schema: orderSchema,
    init: { method: "POST", cache: "no-store" },
  });
}

export async function updateOrderStatus({
  userId,
  orderId,
  status,
}: {
  userId: string;
  orderId: string;
  status: OrderStatus;
}): Promise<Order> {
  return fetchJson({
    path: `/api/orders/${userId}/${orderId}`,
    schema: orderSchema,
    init: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      cache: "no-store",
    },
  });
}
