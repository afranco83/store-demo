import { afterEach, describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { expectNoAccessibilityViolations } from "@store-demo/testing";

import { renderWithProviders } from "@/test/render-with-intl";
import { useCheckoutWizardStore } from "../store/use-checkout-wizard-store";
import { PaymentStepForm } from "./PaymentStepForm";

describe("PaymentStepForm", () => {
  afterEach(() => {
    useCheckoutWizardStore.getState().reset();
  });

  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<PaymentStepForm />);

    await expectNoAccessibilityViolations(container);
  });

  it("should show a validation error for a card number that is not 16 digits", async () => {
    const { user } = renderWithProviders(<PaymentStepForm />);

    await user.type(screen.getByLabelText("Nombre del titular"), "Cliente Uno");
    await user.type(screen.getByLabelText("Número de tarjeta"), "4242");
    await user.click(screen.getByRole("button", { name: "Continuar a revisión" }));

    expect(await screen.findAllByRole("alert")).not.toHaveLength(0);
    expect(useCheckoutWizardStore.getState().currentStepId).toBe("shipping");
  });

  it("should go back to the shipping step when clicking the back button", async () => {
    const { user } = renderWithProviders(<PaymentStepForm />);

    await user.click(screen.getByRole("button", { name: "Volver a envío" }));

    expect(useCheckoutWizardStore.getState().currentStepId).toBe("shipping");
  });

  it("should complete the payment step and advance to review on valid submit", async () => {
    const { user } = renderWithProviders(<PaymentStepForm />);

    await user.type(screen.getByLabelText("Nombre del titular"), "Cliente Uno");
    await user.type(screen.getByLabelText("Número de tarjeta"), "4242424242424242");
    await user.type(screen.getByLabelText("Mes de caducidad"), "12");
    await user.type(screen.getByLabelText("Año de caducidad"), "2030");
    await user.type(screen.getByLabelText("CVC"), "123");
    await user.click(screen.getByRole("button", { name: "Continuar a revisión" }));

    await waitFor(() => expect(useCheckoutWizardStore.getState().currentStepId).toBe("review"));
    expect(useCheckoutWizardStore.getState().payment).toMatchObject({
      cardholderName: "Cliente Uno",
      cardNumber: "4242424242424242",
    });
  });
});
