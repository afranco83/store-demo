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
import type { Category } from "@store-demo/shared-types";

import { deleteCategoryAction } from "../api/delete-category.action";

export interface CategoriesTableProps {
  categories: Category[];
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const router = useRouter();
  const [pendingDeleteSlug, setPendingDeleteSlug] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startTransition] = useTransition();

  function handleConfirmDelete() {
    if (!pendingDeleteSlug) return;
    const slug = pendingDeleteSlug;
    startTransition(async () => {
      const result = await deleteCategoryAction(slug);
      if ("error" in result) {
        setDeleteError(result.error);
        return;
      }
      setPendingDeleteSlug(null);
      router.refresh();
    });
  }

  if (categories.length === 0) {
    return <p className="text-sm text-gray-600">No hay categorías todavía.</p>;
  }

  return (
    <>
      <Table caption="Categorías">
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Nombre</TableHeaderCell>
            <TableHeaderCell>Slug</TableHeaderCell>
            <TableHeaderCell>Acciones</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.slug}</TableCell>
              <TableCell>
                <div className="flex gap-3">
                  <Link
                    href={`/categories/${category.slug}/edit`}
                    className="text-sm font-medium text-accent"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="text-sm font-medium text-red-600"
                    onClick={() => {
                      setDeleteError(null);
                      setPendingDeleteSlug(category.slug);
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
        title="¿Eliminar categoría?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteSlug(null)}
      />
    </>
  );
}
