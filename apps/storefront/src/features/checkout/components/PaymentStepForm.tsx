"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button, Input } from "@store-demo/ui";
import { simulatedPaymentSchema } from "@store-demo/shared-types";
import type { SimulatedPayment } from "@store-demo/shared-types";

import { useCheckoutWizardStore } from "../store/use-checkout-wizard-store";

export function PaymentStepForm() {
  const t = useTranslations("checkout.paymentForm");
  const payment = useCheckoutWizardStore((state) => state.payment);
  const completePaymentStep = useCheckoutWizardStore((state) => state.completePaymentStep);
  const goToStep = useCheckoutWizardStore((state) => state.goToStep);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SimulatedPayment>({
    resolver: zodResolver(simulatedPaymentSchema),
    defaultValues: payment ?? {
      cardholderName: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvc: "",
    },
  });

  function onSubmit(data: SimulatedPayment) {
    completePaymentStep(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input
        label={t("cardholderNameLabel")}
        autoComplete="cc-name"
        error={errors.cardholderName?.message}
        {...register("cardholderName")}
      />
      <Input
        label={t("cardNumberLabel")}
        inputMode="numeric"
        autoComplete="cc-number"
        maxLength={16}
        error={errors.cardNumber?.message}
        {...register("cardNumber")}
      />
      <div className="flex gap-4">
        <Input
          label={t("expiryMonthLabel")}
          inputMode="numeric"
          autoComplete="cc-exp-month"
          placeholder={t("expiryMonthPlaceholder")}
          maxLength={2}
          error={errors.expiryMonth?.message}
          {...register("expiryMonth")}
        />
        <Input
          label={t("expiryYearLabel")}
          inputMode="numeric"
          autoComplete="cc-exp-year"
          placeholder={t("expiryYearPlaceholder")}
          maxLength={4}
          error={errors.expiryYear?.message}
          {...register("expiryYear")}
        />
        <Input
          label={t("cvcLabel")}
          inputMode="numeric"
          autoComplete="cc-csc"
          maxLength={4}
          error={errors.cvc?.message}
          {...register("cvc")}
        />
      </div>
      <div className="flex gap-3">
        <Button type="button" intent="outline" onClick={() => goToStep("shipping")}>
          {t("backButton")}
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {t("continueButton")}
        </Button>
      </div>
    </form>
  );
}
