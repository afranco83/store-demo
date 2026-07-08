import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { CartLineItem } from "./CartLineItem";

describe("CartLineItem", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(
      <CartLineItem
        name="Camiseta gráfica"
        imageUrl="https://example.com/shirt.jpg"
        priceCents={2999}
        quantity={2}
        onQuantityChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    await expectNoAccessibilityViolations(container);
  });

  it("should render the name, price and quantity", () => {
    renderWithProviders(
      <CartLineItem
        name="Camiseta gráfica"
        imageUrl="https://example.com/shirt.jpg"
        priceCents={2999}
        quantity={2}
        onQuantityChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText("Camiseta gráfica")).toBeInTheDocument();
    expect(screen.getByText("29,99 €")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should call onQuantityChange when the quantity is increased", async () => {
    const handleQuantityChange = vi.fn();
    const { user } = renderWithProviders(
      <CartLineItem
        name="Gorra"
        imageUrl="https://example.com/cap.jpg"
        priceCents={1500}
        quantity={1}
        onQuantityChange={handleQuantityChange}
        onRemove={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));

    expect(handleQuantityChange).toHaveBeenCalledWith(2);
  });

  it("should call onRemove when the remove button is clicked", async () => {
    const handleRemove = vi.fn();
    const { user } = renderWithProviders(
      <CartLineItem
        name="Zapatillas"
        imageUrl="https://example.com/shoes.jpg"
        priceCents={7999}
        quantity={1}
        onQuantityChange={vi.fn()}
        onRemove={handleRemove}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Remove item" }));

    expect(handleRemove).toHaveBeenCalledOnce();
  });

  it("should disable the quantity selector and remove button while updating", () => {
    renderWithProviders(
      <CartLineItem
        name="Zapatillas"
        imageUrl="https://example.com/shoes.jpg"
        priceCents={7999}
        quantity={1}
        onQuantityChange={vi.fn()}
        onRemove={vi.fn()}
        isUpdating
      />,
    );

    expect(screen.getByRole("button", { name: "Remove item" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
  });
});
