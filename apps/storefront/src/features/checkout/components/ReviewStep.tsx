"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Button, OrderSummaryCard, PriceTag, Typography, buttonVariants, cn } from "@store-demo/ui";
import { calculateShippingCents } from "@store-demo/shared-types";
import type { CheckoutRequest } from "@store-demo/shared-types";

import { useCart } from "../../cart/hooks/use-cart";
import { cartQueryKey } from "../../cart/hooks/cart-query-key";
import {
  ORDER_STATUS_BADGES,
  formatOrderItemCountLabel,
  formatOrderPlacedAtLabel,
} from "../../orders/lib/format-order";
import { createOrderAction } from "../api/create-order.action";
import { useCheckoutWizardStore } from "../store/use-checkout-wizard-store";

export function ReviewStep() {
  const queryClient = useQueryClient();
  const cartQuery = useCart();
  const cartItems = cartQuery.data ?? [];

  const shippingAddress = useCheckoutWizardStore((state) => state.shippingAddress);
  const payment = useCheckoutWizardStore((state) => state.payment);
  const confirmedOrder = useCheckoutWizardStore((state) => state.confirmedOrder);
  const serverError = useCheckoutWizardStore((state) => state.serverError);
  const goToStep = useCheckoutWizardStore((state) => state.goToStep);
  const setConfirmedOrder = useCheckoutWizardStore((state) => state.setConfirmedOrder);
  const setServerError = useCheckoutWizardStore((state) => state.setServerError);

  const [isConfirming, setIsConfirming] = useState(false);

  if (confirmedOrder) {
    return (
      <div className="flex flex-col gap-4">
        <Typography as="h2" variant="heading">
          ¡Gracias por tu pedido!
        </Typography>
        <Typography variant="body">
          Hemos recibido tu pedido correctamente. Puedes consultar su estado en cualquier momento
          desde tu historial de pedidos.
        </Typography>
        <OrderSummaryCard
          orderId={confirmedOrder.id}
          placedAtLabel={formatOrderPlacedAtLabel(confirmedOrder)}
          statusBadge={ORDER_STATUS_BADGES[confirmedOrder.status]}
          totalCents={confirmedOrder.totalCents}
          itemCountLabel={formatOrderItemCountLabel(confirmedOrder)}
        />
        <Link href="/account/orders" className={cn(buttonVariants(), "self-start")}>
          Ver mis pedidos
        </Link>
      </div>
    );
  }

  if (!shippingAddress || !payment) {
    return null;
  }

  // Reasigna a un objeto concreto (no nullable) en vez de referenciar
  // shippingAddress/payment directamente dentro del closure: TypeScript no
  // conserva el estrechamiento de tipo de la guarda de arriba dentro de una
  // función anidada.
  const checkoutData: CheckoutRequest = { shippingAddress, payment };

  const subtotalCents = cartItems.reduce(
    (sum, item) => sum + item.product.priceCents * item.quantity,
    0,
  );
  const shippingCents = calculateShippingCents(subtotalCents);
  const totalCents = subtotalCents + shippingCents;

  async function handleConfirm() {
    setIsConfirming(true);
    setServerError(null);
    const result = await createOrderAction(checkoutData);
    setIsConfirming(false);

    if ("error" in result) {
      setServerError(result.error);
      return;
    }

    setConfirmedOrder(result.order);
    // apps/api ya vació el carrito dentro de la misma transacción de
    // POST /api/orders; la caché de TanStack Query del cliente no se entera
    // sola, así que hay que invalidarla explícitamente (si no, el
    // navbar/drawer seguirían mostrando los artículos ya comprados).
    await queryClient.invalidateQueries({ queryKey: cartQueryKey });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Typography variant="caption">Dirección de envío</Typography>
          <Typography as="p" variant="body">
            {shippingAddress.fullName}
          </Typography>
          <Typography as="p" variant="body">
            {shippingAddress.addressLine1}
            {shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ""}
          </Typography>
          <Typography as="p" variant="body">
            {shippingAddress.postalCode} {shippingAddress.city}, {shippingAddress.country}
          </Typography>
        </div>
        <Button type="button" intent="ghost" size="sm" onClick={() => goToStep("shipping")}>
          Editar
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <Typography variant="caption">Pago</Typography>
          <Typography as="p" variant="body">
            •••• {payment.cardNumber.slice(-4)}
          </Typography>
        </div>
        <Button type="button" intent="ghost" size="sm" onClick={() => goToStep("payment")}>
          Editar
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Typography variant="caption">Artículos</Typography>
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4">
            <Typography as="p" variant="body">
              {item.product.name} × {item.quantity}
            </Typography>
            <PriceTag amountCents={item.product.priceCents * item.quantity} size="sm" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <Typography variant="caption">Subtotal</Typography>
          <PriceTag amountCents={subtotalCents} size="sm" />
        </div>
        <div className="flex items-center justify-between">
          <Typography variant="caption">Envío</Typography>
          <PriceTag amountCents={shippingCents} size="sm" />
        </div>
        <div className="flex items-center justify-between">
          <Typography as="p" variant="body" className="font-medium">
            Total
          </Typography>
          <PriceTag amountCents={totalCents} />
        </div>
      </div>

      {serverError ? (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      ) : null}

      <Button
        type="button"
        isLoading={isConfirming}
        onClick={() => void handleConfirm()}
        className="self-start"
      >
        Confirmar pedido
      </Button>
    </div>
  );
}
