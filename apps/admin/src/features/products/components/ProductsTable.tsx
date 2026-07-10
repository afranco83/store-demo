"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ConfirmDialog,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@store-demo/ui";
import type { Category, Product } from "@store-demo/shared-types";

import { deleteProductAction } from "../api/delete-product.action";

export interface ProductsTableProps {
  products: Product[];
  categories: Category[];
}

const CENTS_PER_UNIT = 100;

export function ProductsTable({ products, categories }: ProductsTableProps) {
  const router = useRouter();
  const [pendingDeleteSlug, setPendingDeleteSlug] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startTransition] = useTransition();

  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  function handleConfirmDelete() {
    if (!pendingDeleteSlug) return;
    const slug = pendingDeleteSlug;
    startTransition(async () => {
      const result = await deleteProductAction(slug);
      if ("error" in result) {
        setDeleteError(result.error);
        return;
      }
      setPendingDeleteSlug(null);
      router.refresh();
    });
  }

  if (products.length === 0) {
    return <p className="text-sm text-gray-600">No hay productos todavía.</p>;
  }

  return (
    <>
      <Table caption="Productos">
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Nombre</TableHeaderCell>
            <TableHeaderCell>Categoría</TableHeaderCell>
            <TableHeaderCell>Precio</TableHeaderCell>
            <TableHeaderCell>Stock</TableHeaderCell>
            <TableHeaderCell>Acciones</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{categoryNameById.get(product.categoryId) ?? "—"}</TableCell>
              <TableCell>{(product.priceCents / CENTS_PER_UNIT).toFixed(2)} €</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                <div className="flex gap-3">
                  <Link
                    href={`/products/${product.slug}/edit`}
                    className="text-sm font-medium text-accent"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="text-sm font-medium text-red-600"
                    onClick={() => {
                      setDeleteError(null);
                      setPendingDeleteSlug(product.slug);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {deleteError ? (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {deleteError}
        </p>
      ) : null}
      <ConfirmDialog
        isOpen={pendingDeleteSlug !== null}
        title="¿Eliminar producto?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteSlug(null)}
      />
    </>
  );
}
