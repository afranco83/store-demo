import type { Metadata } from "next";
import { getCategoryBySlug } from "@store-demo/api-client";
import { fetchOrNotFound } from "@store-demo/core";
import { Typography } from "@store-demo/ui";

import { CategoryForm } from "@/features/categories/components/CategoryForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchOrNotFound(getCategoryBySlug({ slug }));

  return { title: `Editar ${category.name}` };
}

export default async function EditCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = await fetchOrNotFound(getCategoryBySlug({ slug }));

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        Editar categoría
      </Typography>
      <CategoryForm category={category} />
    </main>
  );
}
