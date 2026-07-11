import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiClientError, getCategories, getProductBySlug } from "@store-demo/api-client";
import { Typography } from "@store-demo/ui";

import { ProductForm } from "@/features/products/components/ProductForm";

export const dynamic = "force-dynamic";

async function fetchProductOrNotFound(slug: string) {
  return getProductBySlug({ slug }).catch((error: unknown) => {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductOrNotFound(slug);

  return { title: `Editar ${product.name}` };
}

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [product, categories] = await Promise.all([fetchProductOrNotFound(slug), getCategories()]);

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        Editar producto
      </Typography>
      <ProductForm categories={categories} product={product} />
    </main>
  );
}
