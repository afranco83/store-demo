"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@store-demo/ui";
import { loginRequestSchema } from "@store-demo/shared-types";
import type { LoginRequest } from "@store-demo/shared-types";

import { loginAction } from "../api/login.action";

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({ resolver: zodResolver(loginRequestSchema) });

  async function onSubmit(data: LoginRequest) {
    setServerError(null);
    const result = await loginAction(data);
    if (result?.error) {
      setServerError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
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
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      {serverError ? (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      ) : null}
      <Button type="submit" isLoading={isSubmitting}>
        Iniciar sesión
      </Button>
    </form>
  );
}
