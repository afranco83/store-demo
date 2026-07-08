import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { Navbar } from "./Navbar";

describe("Navbar", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(
      <Navbar
        logoSlot={<span>Store Demo</span>}
        navSlot={<a href="/products">Products</a>}
        onCartClick={vi.fn()}
      />,
    );

    await expectNoAccessibilityViolations(container);
  });

  it("should render the logo and nav slots", () => {
    renderWithProviders(
      <Navbar
        logoSlot={<span>Store Demo</span>}
        navSlot={<a href="/products">Products</a>}
        onCartClick={vi.fn()}
      />,
    );

    expect(screen.getByText("Store Demo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Products" })).toBeInTheDocument();
  });

  it("should call onCartClick when the cart button is clicked", async () => {
    const handleCartClick = vi.fn();
    const { user } = renderWithProviders(
      <Navbar logoSlot={<span>Store Demo</span>} navSlot={null} onCartClick={handleCartClick} />,
    );

    await user.click(screen.getByRole("button", { name: "Open cart" }));

    expect(handleCartClick).toHaveBeenCalledOnce();
  });

  it("should show the cart item count badge when greater than zero", () => {
    renderWithProviders(
      <Navbar
        logoSlot={<span>Store Demo</span>}
        navSlot={null}
        onCartClick={vi.fn()}
        cartItemCount={3}
      />,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should not show the cart item count badge when zero", () => {
    renderWithProviders(
      <Navbar
        logoSlot={<span>Store Demo</span>}
        navSlot={null}
        onCartClick={vi.fn()}
        cartItemCount={0}
      />,
    );

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
