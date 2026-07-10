import { describe, expect, it } from "vitest";
import { createOrderFixture, createOrderItemFixture } from "@store-demo/testing";

import {
  formatOrderItemCountLabel,
  formatOrderPlacedAtLabel,
  ORDER_STATUS_BADGES,
} from "./format-order";

describe("format-order", () => {
  it("should format the placed-at date in Spanish long style", () => {
    const order = createOrderFixture({ createdAt: new Date("2026-07-10T10:00:00.000Z") });

    expect(formatOrderPlacedAtLabel(order)).toContain("2026");
  });

  it("should singularize the item count label for a single unit", () => {
    const order = createOrderFixture({ items: [createOrderItemFixture({ quantity: 1 })] });

    expect(formatOrderItemCountLabel(order)).toBe("1 artículo");
  });

  it("should pluralize the item count label and sum quantities across items", () => {
    const order = createOrderFixture({
      items: [createOrderItemFixture({ quantity: 2 }), createOrderItemFixture({ quantity: 3 })],
    });

    expect(formatOrderItemCountLabel(order)).toBe("5 artículos");
  });

  it("should expose a badge for every order status", () => {
    expect(Object.keys(ORDER_STATUS_BADGES).sort()).toEqual(
      ["cancelled", "delivered", "paid", "pending", "shipped"].sort(),
    );
  });
});
