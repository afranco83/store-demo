import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { ProductCard } from "./ProductCard";

describe("ProductCard", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(
      <ProductCard
        name="Camiseta gráfica"
        imageUrl="https://example.com/shirt.jpg"
        priceCents={2999}
      />,
    );

    await expectNoAccessibilityViolations(container);
  });

  it("should render the name and formatted price", () => {
    renderWithProviders(
      <ProductCard
        name="Camiseta gráfica"
        imageUrl="https://example.com/shirt.jpg"
        priceCents={2999}
      />,
    );

    expect(screen.getByRole("heading", { name: "Camiseta gráfica" })).toBeInTheDocument();
    expect(screen.getByText("29,99 €")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Camiseta gráfica" })).toHaveAttribute(
      "src",
      "https://example.com/shirt.jpg",
    );
  });

  it("should render the stock badge when provided", () => {
    renderWithProviders(
      <ProductCard
        name="Gorra"
        imageUrl="https://example.com/cap.jpg"
        priceCents={1500}
        stockBadge={{ label: "Últimas unidades", intent: "warning" }}
      />,
    );

    expect(screen.getByText("Últimas unidades")).toBeInTheDocument();
  });

  it("should not render a badge when stockBadge is not provided", () => {
    renderWithProviders(
      <ProductCard name="Zapatillas" imageUrl="https://example.com/shoes.jpg" priceCents={7999} />,
    );

    expect(screen.queryByText(/unidades|agotado/i)).not.toBeInTheDocument();
  });
});
