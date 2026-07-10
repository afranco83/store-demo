"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button, Input, Select, Textarea } from "@store-demo/ui";
import { createProductSchema } from "@store-demo/shared-types";
import type { Category, CreateProduct, Product } from "@store-demo/shared-types";

// createProductSchema.stock tiene .default(0): el tipo de entrada (lo que
// maneja el formulario) lo hace opcional, aunque la salida ya validada
// (CreateProduct) siempre lo trae relleno. El 3er genérico de useForm fija
// el tipo de salida que recibe onSubmit, evitando este desajuste conocido
// entre RHF y los defaults de Zod.
type ProductFormInput = z.input<typeof createProductSchema>;

import { createProductAction } from "../api/create-product.action";
import { updateProductAction } from "../api/update-product.action";

export interface ProductFormProps {
  categories: Category[];
  product?: Product;
}

// Un único formulario para crear/editar: la edición también exige todos los
// campos válidos (no es un PATCH parcial desde la UI), así que se valida
// siempre contra createProductSchema — updateProductAction ya revalida server
// side contra updateProductSchema (partial), que un objeto completo también
// satisface.
export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditMode = Boolean(product);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, CreateProduct>({
    resolver: zodResolver(createProductSchema),
    defaultValues: product
      ? {
          slug: product.slug,
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
          imageUrl: product.imageUrl,
          stock: product.stock,
          categoryId: product.categoryId,
        }
      : { stock: 0 },
  });

  async function onSubmit(data: CreateProduct) {
    setServerError(null);
    const result = product
      ? await updateProductAction({ slug: product.slug, data })
      : await createProductAction(data);
    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    router.push("/products");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input label="Slug" error={errors.slug?.message} {...register("slug")} />
      <Input label="Nombre" error={errors.name?.message} {...register("name")} />
      <Textarea
        label="Descripción"
        error={errors.description?.message}
        {...register("description")}
      />
      <Input
        type="number"
        label="Precio (céntimos)"
        hint="1 € = 100 céntimos"
        min={0}
        step={1}
        error={errors.priceCents?.message}
        {...register("priceCents", { valueAsNumber: true })}
      />
      <Input
        type="number"
        label="Stock"
        min={0}
        step={1}
        error={errors.stock?.message}
        {...register("stock", { valueAsNumber: true })}
      />
      <Select label="Categoría" error={errors.categoryId?.message} {...register("categoryId")}>
        <option value="">Selecciona una categoría</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <Input
        type="url"
        label="URL de la imagen"
        error={errors.imageUrl?.message}
        {...register("imageUrl")}
      />
      {serverError ? (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      ) : null}
      <Button type="submit" isLoading={isSubmitting} className="self-start">
        {isEditMode ? "Guardar cambios" : "Crear producto"}
      </Button>
    </form>
  );
}
