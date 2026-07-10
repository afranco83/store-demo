import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import {
  createCartItemFixture,
  createOrderFixture,
  renderWithProviders,
  server,
} from "@store-demo/testing";
import { http, HttpResponse } from "msw";

import { useCheckoutWizardStore } from "../store/use-checkout-wizard-store";
import { createOrderAction } from "../api/create-order.action";
import { ReviewStep } from "./ReviewStep";

vi.mock("../api/create-order.action", () => ({
  createOrderAction: vi.fn(),
}));

const mockedCreateOrderAction = vi.mocked(createOrderAction);

const shippingAddress = {
  fullName: "Cliente Uno",
  addressLine1: "Calle Falsa 123",
  city: "Madrid",
  postalCode: "28080",
  country: "ES",
};

const payment = {
  cardholderName: "Cliente Uno",
  cardNumber: "4242424242424242",
  expiryMonth: "12",
  expiryYear: "2030",
  cvc: "123",
};

function fillWizardUpToReview() {
  useCheckoutWizardStore.getState().completeShippingStep(shippingAddress);
  useCheckoutWizardStore.getState().completePaymentStep(payment);
}

// El nombre del producto comparte elemento con "× {cantidad}" (una sola
// línea de texto), así que un match exacto por texto nunca casa contra el
// nombre solo — se busca como substring del texto completo de la línea.
function productLineMatcher(productName: string) {
  return new RegExp(productName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
}

describe("ReviewStep", () => {
  afterEach(() => {
    useCheckoutWizardStore.getState().reset();
  });

  it("should show the shipping address, masked card and cart items", async () => {
    const cartItem = createCartItemFixture({ quantity: 2 });
    server.use(http.get("*/api/cart", () => HttpResponse.json({ data: [cartItem] })));
    fillWizardUpToReview();

    renderWithProviders(<ReviewStep />);

    await waitFor(() =>
      expect(screen.getByText(productLineMatcher(cartItem.product.name))).toBeInTheDocument(),
    );
    expect(screen.getByText("Cliente Uno")).toBeInTheDocument();
    expect(screen.getByText("•••• 4242")).toBeInTheDocument();
  });

  it("should confirm the order and show the confirmation view on success", async () => {
    const cartItem = createCartItemFixture({ quantity: 1 });
    const order = createOrderFixture();
    server.use(http.get("*/api/cart", () => HttpResponse.json({ data: [cartItem] })));
    mockedCreateOrderAction.mockResolvedValue({ order });
    fillWizardUpToReview();

    const { user } = renderWithProviders(<ReviewStep />);

    await waitFor(() =>
      expect(screen.getByText(productLineMatcher(cartItem.product.name))).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    expect(await screen.findByText("¡Gracias por tu pedido!")).toBeInTheDocument();
    expect(mockedCreateOrderAction).toHaveBeenCalledWith({ shippingAddress, payment });
  });

  it("should show the server error and keep the entered data when the payment is declined", async () => {
    const cartItem = createCartItemFixture({ quantity: 1 });
    server.use(http.get("*/api/cart", () => HttpResponse.json({ data: [cartItem] })));
    mockedCreateOrderAction.mockResolvedValue({
      error: "Pago rechazado. Comprueba los datos de tu tarjeta e inténtalo de nuevo.",
    });
    fillWizardUpToReview();

    const { user } = renderWithProviders(<ReviewStep />);

    await waitFor(() =>
      expect(screen.getByText(productLineMatcher(cartItem.product.name))).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    expect(
      await screen.findByText(
        "Pago rechazado. Comprueba los datos de tu tarjeta e inténtalo de nuevo.",
      ),
    ).toBeInTheDocument();
    expect(useCheckoutWizardStore.getState().shippingAddress).toEqual(shippingAddress);
    expect(useCheckoutWizardStore.getState().payment).toEqual(payment);
    expect(useCheckoutWizardStore.getState().confirmedOrder).toBeNull();
  });

  it("should navigate back to the shipping/payment steps when editing", async () => {
    const cartItem = createCartItemFixture({ quantity: 1 });
    server.use(http.get("*/api/cart", () => HttpResponse.json({ data: [cartItem] })));
    fillWizardUpToReview();

    const { user } = renderWithProviders(<ReviewStep />);

    await waitFor(() =>
      expect(screen.getByText(productLineMatcher(cartItem.product.name))).toBeInTheDocument(),
    );
    const editButtons = screen.getAllByRole("button", { name: "Editar" });
    await user.click(editButtons[0]!);

    expect(useCheckoutWizardStore.getState().currentStepId).toBe("shipping");
  });
});
