"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button, Input } from "@store-demo/ui";
import { updateProfileRequestSchema } from "@store-demo/shared-types";
import type { UpdateProfileRequest, User } from "@store-demo/shared-types";

import { updateProfileAction } from "../api/update-profile.action";

export function EditProfileForm({ profile }: { profile: User }) {
  const t = useTranslations("account");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileRequest>({
    resolver: zodResolver(updateProfileRequestSchema),
    defaultValues: { name: profile.name, email: profile.email },
  });

  async function onSubmit(data: UpdateProfileRequest) {
    setServerError(null);
    setIsSaved(false);
    const result = await updateProfileAction(data);
    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    // Refleja lo que devuelve apps/api (por si normaliza algo), no solo lo
    // que el usuario tecleó.
    reset({ name: result.user.name, email: result.user.email });
    setIsSaved(true);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onChange={() => setIsSaved(false)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Input
        label={t("nameLabel")}
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        type="email"
        label={t("emailLabel")}
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      {serverError ? (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      ) : null}
      {isSaved ? <p className="text-sm text-green-700">{t("savedMessage")}</p> : null}
      <Button type="submit" isLoading={isSubmitting} className="self-start">
        {t("saveButton")}
      </Button>
    </form>
  );
}
