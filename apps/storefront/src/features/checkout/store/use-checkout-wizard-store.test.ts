import { afterEach, describe, expect, it } from "vitest";

import { useCheckoutWizardStore } from "./use-checkout-wizard-store";

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

describe("useCheckoutWizardStore", () => {
  afterEach(() => {
    useCheckoutWizardStore.getState().reset();
  });

  it("should start on the shipping step with no data", () => {
    const state = useCheckoutWizardStore.getState();

    expect(state.currentStepId).toBe("shipping");
    expect(state.completedStepIds).toEqual([]);
    expect(state.shippingAddress).toBeNull();
    expect(state.payment).toBeNull();
    expect(state.confirmedOrder).toBeNull();
  });

  it("should complete the shipping step and advance to payment", () => {
    useCheckoutWizardStore.getState().completeShippingStep(shippingAddress);

    const state = useCheckoutWizardStore.getState();
    expect(state.shippingAddress).toEqual(shippingAddress);
    expect(state.completedStepIds).toEqual(["shipping"]);
    expect(state.currentStepId).toBe("payment");
  });

  it("should complete the payment step and advance to review", () => {
    useCheckoutWizardStore.getState().completeShippingStep(shippingAddress);
    useCheckoutWizardStore.getState().completePaymentStep(payment);

    const state = useCheckoutWizardStore.getState();
    expect(state.payment).toEqual(payment);
    expect(state.completedStepIds).toEqual(["shipping", "payment"]);
    expect(state.currentStepId).toBe("review");
  });

  it("should not duplicate a step id when completing it more than once", () => {
    useCheckoutWizardStore.getState().completeShippingStep(shippingAddress);
    useCheckoutWizardStore.getState().goToStep("shipping");
    useCheckoutWizardStore.getState().completeShippingStep(shippingAddress);

    expect(useCheckoutWizardStore.getState().completedStepIds).toEqual(["shipping"]);
  });

  it("should navigate back to a previous step without losing its data", () => {
    useCheckoutWizardStore.getState().completeShippingStep(shippingAddress);
    useCheckoutWizardStore.getState().completePaymentStep(payment);
    useCheckoutWizardStore.getState().goToStep("shipping");

    const state = useCheckoutWizardStore.getState();
    expect(state.currentStepId).toBe("shipping");
    expect(state.shippingAddress).toEqual(shippingAddress);
    expect(state.payment).toEqual(payment);
  });

  it("should set and clear the server error", () => {
    useCheckoutWizardStore.getState().setServerError("Pago rechazado.");
    expect(useCheckoutWizardStore.getState().serverError).toBe("Pago rechazado.");

    useCheckoutWizardStore.getState().goToStep("payment");
    expect(useCheckoutWizardStore.getState().serverError).toBeNull();
  });

  it("should set the confirmed order", () => {
    const order = { id: "order-1" } as never;
    useCheckoutWizardStore.getState().setConfirmedOrder(order);

    expect(useCheckoutWizardStore.getState().confirmedOrder).toBe(order);
  });

  it("should reset the whole store", () => {
    useCheckoutWizardStore.getState().completeShippingStep(shippingAddress);
    useCheckoutWizardStore.getState().completePaymentStep(payment);

    useCheckoutWizardStore.getState().reset();

    const state = useCheckoutWizardStore.getState();
    expect(state.currentStepId).toBe("shipping");
    expect(state.completedStepIds).toEqual([]);
    expect(state.shippingAddress).toBeNull();
    expect(state.payment).toBeNull();
  });
});
