import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@store-demo/testing";
import { getOrders, getOrderById, createOrder, updateOrderStatus } from "./orders.api";
import { ApiClientError } from "./errors";

const token = "fake-jwt-token";

describe("orders.api", () => {
  it("should return the orders for the authenticated user", async () => {
    const orders = await getOrders({ token });

    expect(orders.length).toBeGreaterThan(0);
  });

  it("should return a single order by id", async () => {
    const order = await getOrderById({ token, orderId: "order-1" });

    expect(order.id).toBe("order-1");
  });

  it("should create an order from the current cart", async () => {
    const order = await createOrder({ token });

    expect(order).toHaveProperty("items");
  });

  it("should update the order status", async () => {
    const order = await updateOrderStatus({
      token,
      orderId: "order-1",
      status: "shipped",
    });

    expect(order.id).toBe("order-1");
  });

  it("should throw ApiClientError when the cart is empty", async () => {
    server.use(
      http.post("*/api/orders", () => {
        return HttpResponse.json({ error: { message: "Cart is empty" } }, { status: 400 });
      }),
    );

    await expect(createOrder({ token })).rejects.toThrow(ApiClientError);
  });
});
