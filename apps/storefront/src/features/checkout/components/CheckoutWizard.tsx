"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { EmptyState, WizardSteps, buttonVariants } from "@store-demo/ui";

import { useCart } from "../../cart/hooks/use-cart";
import { useCheckoutWizardStore } from "../store/use-checkout-wizard-store";
import { ShippingStepForm } from "./ShippingStepForm";
import { PaymentStepForm } from "./PaymentStepForm";
import { ReviewStep } from "./ReviewStep";

const STEPS = [
  { id: "shipping", label: "Envío" },
  { id: "payment", label: "Pago" },
  { id: "review", label: "Revisión" },
];

const STEP_COMPONENTS = {
  shipping: ShippingStepForm,
  payment: PaymentStepForm,
  review: ReviewStep,
} as const;

export function CheckoutWizard() {
  const cartQuery = useCart();
  const currentStepId = useCheckoutWizardStore((state) => state.currentStepId);
  const completedStepIds = useCheckoutWizardStore((state) => state.completedStepIds);
  const confirmedOrder = useCheckoutWizardStore((state) => state.confirmedOrder);
  const reset = useCheckoutWizardStore((state) => state.reset);

  // El store del wizard es un singleton a nivel de módulo: sobrevive a
  // cualquier navegación cliente dentro de la misma pestaña (p. ej. el botón
  // "Atrás" del navegador tras confirmar un pedido y añadir productos
  // nuevos al carrito), a diferencia de una recarga completa. Sin este
  // guard, `confirmedOrder` seguiría mostrando la confirmación del pedido
  // anterior aunque el carrito ya tenga artículos de una compra nueva. Se
  // comprueba una sola vez, tras la primera carga del carrito de este
  // montaje (ref, no estado, para no volver a repetir la comprobación en
  // renders posteriores) — así no compite con la invalidación de caché que
  // ocurre DENTRO de esta misma sesión justo al confirmar un pedido (ver
  // ReviewStep.tsx), que también deja el carrito momentáneamente vacío.
  const hasCheckedStaleConfirmation = useRef(false);
  useEffect(() => {
    if (hasCheckedStaleConfirmation.current || cartQuery.isLoading) {
      return;
    }
    hasCheckedStaleConfirmation.current = true;
    if (confirmedOrder && (cartQuery.data?.length ?? 0) > 0) {
      reset();
    }
  }, [cartQuery.isLoading, cartQuery.data, confirmedOrder, reset]);

  // Cubre tanto a quien llega a /checkout sin nada en el carrito como a
  // quien recarga la página justo después de confirmar un pedido: el store
  // del wizard se resetea con el reload (sin persist, ver
  // use-checkout-wizard-store.ts) y el carrito ya está vacío server-side.
  if (!cartQuery.isLoading && cartQuery.data?.length === 0 && !confirmedOrder) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Tu carrito está vacío"
        description="Añade productos del catálogo antes de continuar con el pago."
        action={
          <Link href="/products" className={buttonVariants({})}>
            Ver catálogo
          </Link>
        }
      />
    );
  }

  const StepComponent = STEP_COMPONENTS[currentStepId];

  return (
    <div className="flex flex-col gap-8">
      {!confirmedOrder && (
        <WizardSteps
          steps={STEPS}
          currentStepId={currentStepId}
          completedStepIds={completedStepIds}
          navLabel="Progreso del checkout"
          completedStepLabel="Completado"
        />
      )}
      <StepComponent />
    </div>
  );
}
