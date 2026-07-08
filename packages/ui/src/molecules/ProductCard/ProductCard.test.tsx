import { describe, expect, it, vi } from "vitest";
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

  it("should have no accessibility violations with the add-to-cart button", async () => {
    const { container } = renderWithProviders(
      <ProductCard
        name="Camiseta gráfica"
        imageUrl="https://example.com/shirt.jpg"
        priceCents={2999}
        onAddToCart={vi.fn()}
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

  it("should not render an add-to-cart button when onAddToCart is not provided", () => {
    renderWithProviders(
      <ProductCard name="Zapatillas" imageUrl="https://example.com/shoes.jpg" priceCents={7999} />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should call onAddToCart when the add-to-cart button is clicked", async () => {
    const handleAddToCart = vi.fn();
    const { user } = renderWithProviders(
      <ProductCard
        name="Zapatillas"
        imageUrl="https://example.com/shoes.jpg"
        priceCents={7999}
        onAddToCart={handleAddToCart}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(handleAddToCart).toHaveBeenCalledOnce();
  });
});
