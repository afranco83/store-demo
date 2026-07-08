import { notFound } from "next/navigation";
import { ApiClientError } from "@store-demo/api-client";
import { Badge, PriceTag, Typography } from "@store-demo/ui";

import { getProductBySlug } from "@/features/products/api/products.api";
import { AddToCartButton } from "@/features/products/components/AddToCartButton";
import { getStockBadge } from "@/features/products/services/get-stock-badge";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await getProductBySlug({ slug }).catch((error: unknown) => {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  });

  const stockBadge = getStockBadge(product.stock);

  return (
    <main className="mx-auto grid max-w-4xl gap-8 px-4 py-10 sm:grid-cols-2">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="aspect-square w-full rounded-lg object-cover"
      />
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
