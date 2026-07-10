import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@store-demo/testing";
import { getOrders, getOrderById, createOrder, updateOrderStatus } from "./orders.api";
import { ApiClientError } from "./errors";

const token = "fake-jwt-token";

const shippingAddress = {
  fullName: "Cliente Uno",
  addressLine1: "Calle Falsa 123",
  city: "Madrid",
  postalCode: "28080",
  country: "ES",
};

const payment = {
  cardholderName: "Cliente Uno",
  cardNumber: "4242424242424242",
  expiryMonth: "12",
  expiryYear: "2030",
  cvc: "123",
};

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
    const order = await createOrder({ token, shippingAddress, payment });

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

    await expect(createOrder({ token, shippingAddress, payment })).rejects.toThrow(ApiClientError);
  });

  it("should throw ApiClientError with status 402 when the simulated payment is declined", async () => {
    server.use(
      http.post("*/api/orders", () => {
        return HttpResponse.json(
          { error: { message: "Payment was declined. Check your card details and try again." } },
          { status: 402 },
        );
      }),
    );

    await expect(createOrder({ token, shippingAddress, payment })).rejects.toMatchObject({
      status: 402,
    });
  });
});
