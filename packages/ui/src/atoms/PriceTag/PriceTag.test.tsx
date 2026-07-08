import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { PriceTag } from "./PriceTag";

describe("PriceTag", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<PriceTag amountCents={1999} />);

    await expectNoAccessibilityViolations(container);
  });

  it("should format an amount in cents as euros", () => {
    renderWithProviders(<PriceTag amountCents={2599} />);

    expect(screen.getByText("25,99 €")).toBeInTheDocument();
  });

  it("should format zero cents as a valid price", () => {
    renderWithProviders(<PriceTag amountCents={0} />);

    expect(screen.getByText("0,00 €")).toBeInTheDocument();
  });
});
