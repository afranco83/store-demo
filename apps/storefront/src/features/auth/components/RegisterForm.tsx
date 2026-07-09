"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@store-demo/ui";
import { registerRequestSchema } from "@store-demo/shared-types";
import type { RegisterRequest } from "@store-demo/shared-types";

import { registerAction } from "../api/register.action";

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>({ resolver: zodResolver(registerRequestSchema) });

  async function onSubmit(data: RegisterRequest) {
    setServerError(null);
    const result = await registerAction(data);
    if (result?.error) {
      setServerError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input
        label="Nombre"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        type="email"
        label="Email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        type="password"
        label="Contraseña"
        hint="Mínimo 8 caracteres."
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      {serverError ? (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      ) : null}
      <Button type="submit" isLoading={isSubmitting}>
        Crear cuenta
      </Button>
    </form>
  );
}
