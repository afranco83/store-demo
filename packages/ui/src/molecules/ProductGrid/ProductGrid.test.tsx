import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { ProductGrid } from "./ProductGrid";

describe("ProductGrid", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(
      <ProductGrid>
        <p>Product A</p>
        <p>Product B</p>
      </ProductGrid>,
    );

    await expectNoAccessibilityViolations(container);
  });

  it("should render all its children", () => {
    renderWithProviders(
      <ProductGrid>
        <p>Product A</p>
        <p>Product B</p>
      </ProductGrid>,
    );

    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getByText("Product B")).toBeInTheDocument();
  });
});
