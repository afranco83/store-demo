import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ApiClientError } from "@store-demo/api-client";
import { Badge, PriceTag, Typography } from "@store-demo/ui";

import { getProductBySlug } from "@/features/products/api/products.api";
import { AddToCartButton } from "@/features/products/components/AddToCartButton";
import { getStockBadge } from "@/features/products/services/get-stock-badge";

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
  // Mismo fetch que el componente de página — Next.js deduplica llamadas a
  // fetch idénticas dentro del mismo render (Request Memoization), así que
  // esto no duplica la petición de red real a apps/api.
  const product = await fetchProductOrNotFound(slug);

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await fetchProductOrNotFound(slug);

  const stockBadge = getStockBadge(product.stock);

  return (
    <main className="mx-auto grid max-w-4xl gap-8 px-4 py-10 sm:grid-cols-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>
      <div className="flex flex-col gap-4">
        <Typography as="h1" variant="heading">
          {product.name}
        </Typography>
        {stockBadge ? <Badge intent={stockBadge.intent}>{stockBadge.label}</Badge> : null}
        <PriceTag amountCents={product.priceCents} size="lg" />
        <Typography variant="body" className="text-gray-600">
          {product.description}
        </Typography>
        <AddToCartButton productId={product.id} maxQuantity={product.stock} />
      </div>
    </main>
  );
}
