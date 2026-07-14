import { describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";

import { getStockBadge } from "./get-stock-badge";

const labels = { outOfStock: "Agotado", lowStock: "Últimas unidades" };

describe("getStockBadge", () => {
  it("should return an 'out of stock' badge when stock is zero", () => {
    expect(getStockBadge(0, labels)).toEqual({ label: "Agotado", intent: "danger" });
  });

  it("should return a 'low stock' badge when stock is between 1 and 5", () => {
    const stock = faker.number.int({ min: 1, max: 5 });

    expect(getStockBadge(stock, labels)).toEqual({ label: "Últimas unidades", intent: "warning" });
  });

  it("should return undefined when stock is above the low stock threshold", () => {
    const stock = faker.number.int({ min: 6, max: 500 });

    expect(getStockBadge(stock, labels)).toBeUndefined();
  });
});
