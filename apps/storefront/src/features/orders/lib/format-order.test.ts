import { describe, expect, it } from "vitest";
import { createOrderFixture, createOrderItemFixture } from "@store-demo/testing";

import { formatOrderPlacedAtLabel, getOrderItemCount, getOrderStatusIntent } from "./format-order";

describe("format-order", () => {
  it("should format the placed-at date in the given locale's long style", () => {
    const order = createOrderFixture({ createdAt: new Date("2026-07-10T10:00:00.000Z") });

    expect(formatOrderPlacedAtLabel(order, "es-ES")).toContain("2026");
    expect(formatOrderPlacedAtLabel(order, "en-US")).toContain("2026");
  });

  it("should sum quantities across a single item", () => {
    const order = createOrderFixture({ items: [createOrderItemFixture({ quantity: 1 })] });

    expect(getOrderItemCount(order)).toBe(1);
  });

  it("should sum quantities across multiple items", () => {
    const order = createOrderFixture({
      items: [createOrderItemFixture({ quantity: 2 }), createOrderItemFixture({ quantity: 3 })],
    });

    expect(getOrderItemCount(order)).toBe(5);
  });

  it("should expose an intent for every order status", () => {
    const statuses = ["cancelled", "delivered", "paid", "pending", "shipped"] as const;

    for (const status of statuses) {
      expect(getOrderStatusIntent(status)).toBeDefined();
    }
  });
});
