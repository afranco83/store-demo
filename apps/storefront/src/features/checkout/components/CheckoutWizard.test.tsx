import { afterEach, describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { createCartItemFixture, createOrderFixture, server } from "@store-demo/testing";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "@/test/render-with-intl";
import { useCheckoutWizardStore } from "../store/use-checkout-wizard-store";
import { CheckoutWizard } from "./CheckoutWizard";

describe("CheckoutWizard", () => {
  afterEach(() => {
    useCheckoutWizardStore.getState().reset();
  });

  it("should show the empty-cart state when the cart has no items and no order was just confirmed", async () => {
    server.use(http.get("*/api/cart", () => HttpResponse.json({ data: [] })));

    renderWithProviders(<CheckoutWizard />);

    expect(await screen.findByText("Tu carrito está vacío")).toBeInTheDocument();
  });

  it("should show the shipping step when the cart has items and no order was confirmed", async () => {
    server.use(
      http.get("*/api/cart", () => HttpResponse.json({ data: [createCartItemFixture()] })),
    );

    renderWithProviders(<CheckoutWizard />);

    expect(await screen.findByLabelText("Nombre completo")).toBeInTheDocument();
  });

  it("should keep showing the confirmation view when the cart is empty right after confirming", async () => {
    // currentStepId queda en "review" al confirmar (ReviewStep es el paso
    // activo cuando se llama a setConfirmedOrder en el flujo real), no solo
    // confirmedOrder — replicar ambos para un estado de partida realista.
    server.use(http.get("*/api/cart", () => HttpResponse.json({ data: [] })));
    useCheckoutWizardStore.setState({
      currentStepId: "review",
      confirmedOrder: createOrderFixture(),
    });

    renderWithProviders(<CheckoutWizard />);

    expect(await screen.findByText("¡Gracias por tu pedido!")).toBeInTheDocument();
    // Le da tiempo a la carga del carrito y al effect de detección de
    // confirmación obsoleta a completarse, para confirmar que de verdad NO
    // se dispara con el carrito vacío (no solo que no le dio tiempo).
    await waitFor(() => expect(useCheckoutWizardStore.getState().confirmedOrder).not.toBeNull());
    expect(screen.getByText("¡Gracias por tu pedido!")).toBeInTheDocument();
  });

  it("should discard a stale confirmation and restart the wizard when the cart already has new items", async () => {
    // Simula volver a /checkout (p. ej. con el botón "Atrás" del navegador,
    // sin recarga completa) después de confirmar un pedido anterior y de
    // haber añadido productos nuevos al carrito en esa misma pestaña.
    server.use(
      http.get("*/api/cart", () => HttpResponse.json({ data: [createCartItemFixture()] })),
    );
    useCheckoutWizardStore.setState({
      currentStepId: "review",
      confirmedOrder: createOrderFixture(),
    });

    renderWithProviders(<CheckoutWizard />);

    // Antes de la corrección, esta vista se habría quedado mostrando la
    // confirmación del pedido anterior indefinidamente.
    expect(await screen.findByLabelText("Nombre completo")).toBeInTheDocument();
    expect(screen.queryByText("¡Gracias por tu pedido!")).not.toBeInTheDocument();
    expect(useCheckoutWizardStore.getState().confirmedOrder).toBeNull();
  });
});
