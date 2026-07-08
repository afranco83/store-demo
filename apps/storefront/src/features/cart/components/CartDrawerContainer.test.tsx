import { afterEach, describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { createCartItemFixture, renderWithProviders, server } from "@store-demo/testing";

import { useCartDrawerStore } from "../store/use-cart-drawer-store";
import { CartDrawerContainer } from "./CartDrawerContainer";

describe("CartDrawerContainer", () => {
  afterEach(() => {
    useCartDrawerStore.setState({ isOpen: false });
  });

  it("should show a loading state while the cart is being fetched", () => {
    useCartDrawerStore.getState().open();
    renderWithProviders(<CartDrawerContainer />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should render the cart items once loaded", async () => {
    const cartItem = createCartItemFixture({ quantity: 2 });
    server.use(http.get("*/api/cart/:userId", () => HttpResponse.json({ data: [cartItem] })));

    useCartDrawerStore.getState().open();
    renderWithProviders(<CartDrawerContainer />);

    await waitFor(() => expect(screen.getByText(cartItem.product.name)).toBeInTheDocument());
  });

  it("should show an error message when the cart fails to load", async () => {
    server.use(
      http.get("*/api/cart/:userId", () =>
        HttpResponse.json({ error: { message: "Cart unavailable" } }, { status: 500 }),
      ),
    );

    useCartDrawerStore.getState().open();
    renderWithProviders(<CartDrawerContainer />);

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });

  it("should prevent decreasing an item's quantity below one", async () => {
    const cartItem = createCartItemFixture({ quantity: 1 });
    server.use(http.get("*/api/cart/:userId", () => HttpResponse.json({ data: [cartItem] })));

    useCartDrawerStore.getState().open();
    renderWithProviders(<CartDrawerContainer />);

    await waitFor(() => expect(screen.getByText(cartItem.product.name)).toBeInTheDocument());

    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
  });
});
