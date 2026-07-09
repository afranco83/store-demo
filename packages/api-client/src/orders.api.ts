import { z } from "zod";
import { orderSchema } from "@store-demo/shared-types";
import type { Order, OrderStatus } from "@store-demo/shared-types";
import { fetchJson } from "./http-client";

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export async function getOrders({ token }: { token: string }): Promise<Order[]> {
  return fetchJson({
    path: "/api/orders",
    schema: z.array(orderSchema),
    init: { headers: authHeaders(token), cache: "no-store" },
  });
}

export async function getOrderById({
  token,
  orderId,
}: {
  token: string;
  orderId: string;
}): Promise<Order> {
  return fetchJson({
    path: `/api/orders/${orderId}`,
    schema: orderSchema,
    init: { headers: authHeaders(token), cache: "no-store" },
  });
}

export async function createOrder({ token }: { token: string }): Promise<Order> {
  return fetchJson({
    path: "/api/orders",
    schema: orderSchema,
    init: { method: "POST", headers: authHeaders(token), cache: "no-store" },
  });
}

export async function updateOrderStatus({
  token,
  orderId,
  status,
}: {
  token: string;
  orderId: string;
  status: OrderStatus;
}): Promise<Order> {
  return fetchJson({
    path: `/api/orders/${orderId}`,
    schema: orderSchema,
    init: {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ status }),
      cache: "no-store",
    },
  });
}
