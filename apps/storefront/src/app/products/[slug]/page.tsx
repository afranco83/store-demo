import type { Metadata } from "next";
import Image from "next/image";
import { fetchOrNotFound } from "@store-demo/core";
import { Badge, PriceTag, ProductGrid, Typography } from "@store-demo/ui";

import { getProductBySlug, getProducts } from "@/features/products/api/products.api";
import { AddToCartButton } from "@/features/products/components/AddToCartButton";
import { ProductCardLink } from "@/features/products/components/ProductCardLink";
import { getRelatedProducts } from "@/features/products/services/get-related-products";
import { getStockBadge } from "@/features/products/services/get-stock-badge";
import { SITE_URL } from "@/lib/site-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Mismo fetch que el componente de página — Next.js deduplica llamadas a
  // fetch idénticas dentro del mismo render (Request Memoization), así que
  // esto no duplica la petición de red real a apps/api.
  const product = await fetchOrNotFound(getProductBySlug({ slug }));

  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description },
    twitter: { title: product.name, description: product.description },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [product, allProducts] = await Promise.all([
    fetchOrNotFound(getProductBySlug({ slug })),
    getProducts(),
  ]);

  const stockBadge = getStockBadge(product.stock);
  const relatedProducts = getRelatedProducts(allProducts, product);
  const productUrl = `${SITE_URL}/products/${product.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.imageUrl,
        offers: {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: "EUR",
          price: (product.priceCents / 100).toFixed(2),
          availability:
            product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Catálogo", item: `${SITE_URL}/products` },
          { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
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
      {relatedProducts.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-10">
          <Typography as="h2" variant="heading" className="mb-4">
            También te puede interesar
          </Typography>
          <ProductGrid>
            {relatedProducts.map((relatedProduct) => (
              <ProductCardLink key={relatedProduct.id} product={relatedProduct} />
            ))}
          </ProductGrid>
        </section>
      ) : null}
    </>
  );
}
