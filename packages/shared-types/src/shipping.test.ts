import { describe, expect, it } from "vitest";

import {
  calculateShippingCents,
  FLAT_SHIPPING_CENTS,
  FREE_SHIPPING_THRESHOLD_CENTS,
} from "./shipping";

describe("calculateShippingCents", () => {
  it("should charge the flat shipping rate when the subtotal is below the free shipping threshold", () => {
    expect(calculateShippingCents(FREE_SHIPPING_THRESHOLD_CENTS - 1)).toBe(FLAT_SHIPPING_CENTS);
  });

  it("should be free when the subtotal meets or exceeds the free shipping threshold", () => {
    expect(calculateShippingCents(FREE_SHIPPING_THRESHOLD_CENTS)).toBe(0);
    expect(calculateShippingCents(FREE_SHIPPING_THRESHOLD_CENTS + 1)).toBe(0);
  });
});
