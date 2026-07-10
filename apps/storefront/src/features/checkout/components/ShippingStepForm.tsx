"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@store-demo/ui";
import { shippingAddressSchema } from "@store-demo/shared-types";
import type { ShippingAddress } from "@store-demo/shared-types";

import { useCheckoutWizardStore } from "../store/use-checkout-wizard-store";

export function ShippingStepForm() {
  const shippingAddress = useCheckoutWizardStore((state) => state.shippingAddress);
  const completeShippingStep = useCheckoutWizardStore((state) => state.completeShippingStep);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingAddress>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: shippingAddress ?? {
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      country: "",
    },
  });

  function onSubmit(data: ShippingAddress) {
    completeShippingStep(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input
        label="Nombre completo"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <Input
        label="Dirección"
        autoComplete="address-line1"
        error={errors.addressLine1?.message}
        {...register("addressLine1")}
      />
      <Input
        label="Dirección (línea 2, opcional)"
        autoComplete="address-line2"
        error={errors.addressLine2?.message}
        {...register("addressLine2")}
      />
      <Input
        label="Ciudad"
        autoComplete="address-level2"
        error={errors.city?.message}
        {...register("city")}
      />
      <Input
        label="Código postal"
        autoComplete="postal-code"
        error={errors.postalCode?.message}
        {...register("postalCode")}
      />
      <Input
        label="País"
        autoComplete="country-name"
        error={errors.country?.message}
        {...register("country")}
      />
      <Button type="submit" isLoading={isSubmitting} className="self-start">
        Continuar a pago
      </Button>
    </form>
  );
}
