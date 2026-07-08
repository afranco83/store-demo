import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { CartDrawer, type CartDrawerItem } from "./CartDrawer";

const items: CartDrawerItem[] = [
  {
    id: "cart-item-1",
    name: "Camiseta gráfica",
    imageUrl: "https://example.com/shirt.jpg",
    priceCents: 2999,
    quantity: 2,
    onQuantityChange: vi.fn(),
    onRemove: vi.fn(),
  },
];

describe("CartDrawer", () => {
  it("should have no accessibility violations when open with items", async () => {
    const { baseElement } = renderWithProviders(
      <CartDrawer isOpen onClose={vi.fn()} items={items} subtotalCents={5998} />,
    );

    await expectNoAccessibilityViolations(baseElement);
  });

  it("should render its items and the subtotal", () => {
    renderWithProviders(<CartDrawer isOpen onClose={vi.fn()} items={items} subtotalCents={5998} />);

    expect(screen.getByText("Camiseta gráfica")).toBeInTheDocument();
    expect(screen.getByText("59,98 €")).toBeInTheDocument();
  });

  it("should render an empty state when there are no items", () => {
    renderWithProviders(<CartDrawer isOpen onClose={vi.fn()} items={[]} subtotalCents={0} />);

    expect(screen.getByRole("heading", { name: "Your cart is empty" })).toBeInTheDocument();
  });

  it("should render a spinner when loading", () => {
    renderWithProviders(
      <CartDrawer isOpen onClose={vi.fn()} items={[]} subtotalCents={0} isLoading />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should render the error message when provided", () => {
    renderWithProviders(
      <CartDrawer
        isOpen
        onClose={vi.fn()}
        items={[]}
        subtotalCents={0}
        errorMessage="No se pudo cargar el carrito"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo cargar el carrito");
  });

  it("should call onClose when the close button is clicked", async () => {
    const handleClose = vi.fn();
    const { user } = renderWithProviders(
      <CartDrawer isOpen onClose={handleClose} items={items} subtotalCents={5998} />,
    );

    await user.click(screen.getByRole("button", { name: "Close cart" }));

    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("should call onClose when the backdrop is clicked", async () => {
    const handleClose = vi.fn();
    const { user } = renderWithProviders(
      <CartDrawer isOpen onClose={handleClose} items={items} subtotalCents={5998} />,
    );

    await user.click(screen.getByTestId("cart-drawer-backdrop"));

    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("should call onClose when the Escape key is pressed", async () => {
    const handleClose = vi.fn();
    const { user } = renderWithProviders(
      <CartDrawer isOpen onClose={handleClose} items={items} subtotalCents={5998} />,
    );

    await user.keyboard("{Escape}");

    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("should render nothing when isOpen is false", () => {
    const { container } = renderWithProviders(
      <CartDrawer isOpen={false} onClose={vi.fn()} items={items} subtotalCents={5998} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("should move focus into the dialog when it opens", () => {
    renderWithProviders(<CartDrawer isOpen onClose={vi.fn()} items={items} subtotalCents={5998} />);

    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("should trap Tab focus within the dialog", async () => {
    const { user } = renderWithProviders(
      <CartDrawer isOpen onClose={vi.fn()} items={items} subtotalCents={5998} />,
    );

    const closeButton = screen.getByRole("button", { name: "Close cart" });
    const removeButton = screen.getByRole("button", { name: "Remove item" });

    removeButton.focus();
    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(removeButton).toHaveFocus();
  });

  it("should restore focus to the previously focused element when it closes", () => {
    function Wrapper({ isOpen }: { isOpen: boolean }) {
      return (
        <>
          <button type="button">Open cart</button>
          <CartDrawer isOpen={isOpen} onClose={vi.fn()} items={items} subtotalCents={5998} />
        </>
      );
    }

    const { rerender } = renderWithProviders(<Wrapper isOpen={false} />);
    const triggerButton = screen.getByRole("button", { name: "Open cart" });
    triggerButton.focus();
    expect(triggerButton).toHaveFocus();

    rerender(<Wrapper isOpen />);
    expect(triggerButton).not.toHaveFocus();

    rerender(<Wrapper isOpen={false} />);
    expect(triggerButton).toHaveFocus();
  });
});
