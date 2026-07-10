import { afterEach, describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { useCheckoutWizardStore } from "../store/use-checkout-wizard-store";
import { ShippingStepForm } from "./ShippingStepForm";

describe("ShippingStepForm", () => {
  afterEach(() => {
    useCheckoutWizardStore.getState().reset();
  });

  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<ShippingStepForm />);

    await expectNoAccessibilityViolations(container);
  });

  it("should prefill the form with the shipping address already in the store", () => {
    useCheckoutWizardStore.getState().completeShippingStep({
      fullName: "Cliente Uno",
      addressLine1: "Calle Falsa 123",
      city: "Madrid",
      postalCode: "28080",
      country: "ES",
    });
    useCheckoutWizardStore.getState().goToStep("shipping");

    renderWithProviders(<ShippingStepForm />);

    expect(screen.getByLabelText("Nombre completo")).toHaveValue("Cliente Uno");
    expect(screen.getByLabelText("Dirección")).toHaveValue("Calle Falsa 123");
  });

  it("should show validation errors and not advance the step when required fields are empty", async () => {
    const { user } = renderWithProviders(<ShippingStepForm />);

    await user.click(screen.getByRole("button", { name: "Continuar a pago" }));

    expect(await screen.findAllByRole("alert")).not.toHaveLength(0);
    expect(useCheckoutWizardStore.getState().currentStepId).toBe("shipping");
  });

  it("should complete the shipping step and advance to payment on valid submit", async () => {
    const { user } = renderWithProviders(<ShippingStepForm />);

    await user.type(screen.getByLabelText("Nombre completo"), "Cliente Uno");
    await user.type(screen.getByLabelText("Dirección"), "Calle Falsa 123");
    await user.type(screen.getByLabelText("Ciudad"), "Madrid");
    await user.type(screen.getByLabelText("Código postal"), "28080");
    await user.type(screen.getByLabelText("País"), "ES");
    await user.click(screen.getByRole("button", { name: "Continuar a pago" }));

    await waitFor(() => expect(useCheckoutWizardStore.getState().currentStepId).toBe("payment"));
    expect(useCheckoutWizardStore.getState().shippingAddress).toMatchObject({
      fullName: "Cliente Uno",
      city: "Madrid",
    });
  });
});
