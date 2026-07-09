import { afterEach, describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
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
    server.use(http.get("*/api/cart", () => HttpResponse.json({ data: [cartItem] })));

    useCartDrawerStore.getState().open();
    renderWithProviders(<CartDrawerContainer />);

    await waitFor(() => expect(screen.getByText(cartItem.product.name)).toBeInTheDocument());
  });

  it("should show an error message when the cart fails to load", async () => {
    server.use(
      http.get("*/api/cart", () =>
        HttpResponse.json({ error: { message: "Cart unavailable" } }, { status: 500 }),
      ),
    );

    useCartDrawerStore.getState().open();
    renderWithProviders(<CartDrawerContainer />);

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });

  it("should prevent decreasing an item's quantity below one", async () => {
    const cartItem = createCartItemFixture({ quantity: 1 });
    server.use(http.get("*/api/cart", () => HttpResponse.json({ data: [cartItem] })));

    useCartDrawerStore.getState().open();
    renderWithProviders(<CartDrawerContainer />);

    await waitFor(() => expect(screen.getByText(cartItem.product.name)).toBeInTheDocument());

    expect(screen.getByRole("button", { name: "Reducir cantidad" })).toBeDisabled();
  });

  it("should not clear an item's updating state just because a different item's mutation started", async () => {
    const itemA = createCartItemFixture({ quantity: 1 });
    const itemB = createCartItemFixture({ quantity: 1 });
    // Promesa controlada a mano en vez de un setTimeout real: bajo carga de
    // CPU (p. ej. el resto del pipeline de turbo corriendo en paralelo) un
    // retardo fijo no garantiza que la petición de A siga en curso cuando se
    // hace la aserción, dando falsos negativos intermitentes.
    let resolveItemAResponse: () => void = () => {};
    const itemAResponseGate = new Promise<void>((resolve) => {
      resolveItemAResponse = resolve;
    });

    server.use(
      http.get("*/api/cart", () => HttpResponse.json({ data: [itemA, itemB] })),
      http.patch("*/api/cart/:productId", async ({ params }) => {
        const original = params.productId === itemA.productId ? itemA : itemB;
        if (params.productId === itemA.productId) {
          await itemAResponseGate;
        }
        // Conserva el id original: si cambiara, React remontaría el
        // CartLineItem (key distinta) y el nodo capturado en el test
        // quedaría obsoleto, dando un falso negativo ajeno al bug real.
        return HttpResponse.json({ data: { ...original, quantity: original.quantity + 1 } });
      }),
    );

    useCartDrawerStore.getState().open();
    const { user } = renderWithProviders(<CartDrawerContainer />);

    await waitFor(() => expect(screen.getByText(itemA.product.name)).toBeInTheDocument());

    const [groupA, groupB] = screen.getAllByRole("group");
    if (!groupA || !groupB) {
      throw new Error("Expected two quantity-selector groups, one per cart item");
    }

    await user.click(within(groupA).getByRole("button", { name: "Aumentar cantidad" }));
    await user.click(within(groupB).getByRole("button", { name: "Aumentar cantidad" }));

    // Timeout explícito por encima del default de RTL (1000ms): desde la
    // Fase 5, cada mutación resuelve su identidad (getCartIdentity ->
    // getApiToken -> cookies()) antes de llamar a la API, lo que añade
    // saltos async extra por click — en un runner de CI más cargado que una
    // máquina local, el default puede no ser suficiente y dar un falso
    // negativo ajeno al bug real que este test verifica.
    await waitFor(
      () =>
        expect(
          within(groupB).getByRole("button", { name: "Aumentar cantidad" }),
        ).not.toBeDisabled(),
      { timeout: 5000 },
    );
    expect(within(groupA).getByRole("button", { name: "Aumentar cantidad" })).toBeDisabled();

    resolveItemAResponse();

    await waitFor(
      () =>
        expect(
          within(groupA).getByRole("button", { name: "Aumentar cantidad" }),
        ).not.toBeDisabled(),
      { timeout: 5000 },
    );
  });
});
