"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Textarea } from "@store-demo/ui";
import { createCategorySchema } from "@store-demo/shared-types";
import type { Category, CreateCategory } from "@store-demo/shared-types";

import { createCategoryAction } from "../api/create-category.action";
import { updateCategoryAction } from "../api/update-category.action";

export interface CategoryFormProps {
  category?: Category;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditMode = Boolean(category);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategory>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: category
      ? { slug: category.slug, name: category.name, description: category.description ?? undefined }
      : undefined,
  });

  async function onSubmit(data: CreateCategory) {
    setServerError(null);
    const result = category
      ? await updateCategoryAction({ slug: category.slug, data })
      : await createCategoryAction(data);
    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    router.push("/categories");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input label="Slug" error={errors.slug?.message} {...register("slug")} />
      <Input label="Nombre" error={errors.name?.message} {...register("name")} />
      <Textarea
        label="Descripción"
        error={errors.description?.message}
        // description es opcional pero createCategorySchema exige min(1)
        // cuando se manda: un campo vacío del formulario llega como "" (no
        // undefined), así que se normaliza aquí antes de validar/enviar.
        {...register("description", {
          setValueAs: (value: string) => (value === "" ? undefined : value),
        })}
      />
      {serverError ? (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      ) : null}
      <Button type="submit" isLoading={isSubmitting} className="self-start">
        {isEditMode ? "Guardar cambios" : "Crear categoría"}
      </Button>
    </form>
  );
}
