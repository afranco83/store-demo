import { notFound } from "next/navigation";
import { ApiClientError, getCategoryBySlug } from "@store-demo/api-client";
import { Typography } from "@store-demo/ui";

import { CategoryForm } from "@/features/categories/components/CategoryForm";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = await getCategoryBySlug({ slug }).catch((error: unknown) => {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  });

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        Editar categoría
      </Typography>
      <CategoryForm category={category} />
    </main>
  );
}
