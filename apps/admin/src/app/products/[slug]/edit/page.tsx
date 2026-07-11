import type { Metadata } from "next";
import { getCategories, getProductBySlug } from "@store-demo/api-client";
import { fetchOrNotFound } from "@store-demo/core";
import { Typography } from "@store-demo/ui";

import { ProductForm } from "@/features/products/components/ProductForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchOrNotFound(getProductBySlug({ slug }));

  return { title: `Editar ${product.name}` };
}

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [product, categories] = await Promise.all([
    fetchOrNotFound(getProductBySlug({ slug })),
    getCategories(),
  ]);

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        Editar producto
      </Typography>
      <ProductForm categories={categories} product={product} />
    </main>
  );
}
