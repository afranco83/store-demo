import { create } from "zustand";
import type { Order, ShippingAddress, SimulatedPayment } from "@store-demo/shared-types";

export type CheckoutStepId = "shipping" | "payment" | "review";

interface CheckoutWizardState {
  currentStepId: CheckoutStepId;
  completedStepIds: CheckoutStepId[];
  shippingAddress: ShippingAddress | null;
  payment: SimulatedPayment | null;
  confirmedOrder: Order | null;
  serverError: string | null;
  goToStep: (stepId: CheckoutStepId) => void;
  completeShippingStep: (data: ShippingAddress) => void;
  completePaymentStep: (data: SimulatedPayment) => void;
  setConfirmedOrder: (order: Order) => void;
  setServerError: (message: string | null) => void;
  reset: () => void;
}

const initialState: Pick<
  CheckoutWizardState,
  | "currentStepId"
  | "completedStepIds"
  | "shippingAddress"
  | "payment"
  | "confirmedOrder"
  | "serverError"
> = {
  currentStepId: "shipping",
  completedStepIds: [],
  shippingAddress: null,
  payment: null,
  confirmedOrder: null,
  serverError: null,
};

function withCompletedStep(
  completedStepIds: CheckoutStepId[],
  stepId: CheckoutStepId,
): CheckoutStepId[] {
  return completedStepIds.includes(stepId) ? completedStepIds : [...completedStepIds, stepId];
}

// Deliberadamente sin `persist`: si el usuario recarga a mitad de checkout
// empieza de cero, en vez de sanear datos de tarjeta de un storage que
// sobreviva a la pestaña (el número de tarjeta solo vive en memoria de este
// store, nunca se persiste a disco/DB — ver payment.schema.ts).
export const useCheckoutWizardStore = create<CheckoutWizardState>((set) => ({
  ...initialState,
  goToStep: (stepId) => set({ currentStepId: stepId, serverError: null }),
  completeShippingStep: (data) =>
    set((state) => ({
      shippingAddress: data,
      completedStepIds: withCompletedStep(state.completedStepIds, "shipping"),
      currentStepId: "payment",
    })),
  completePaymentStep: (data) =>
    set((state) => ({
      payment: data,
      completedStepIds: withCompletedStep(state.completedStepIds, "payment"),
      currentStepId: "review",
    })),
  setConfirmedOrder: (order) => set({ confirmedOrder: order, serverError: null }),
  setServerError: (message) => set({ serverError: message }),
  reset: () => set(initialState),
}));
