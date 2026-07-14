import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { fetchOrNotFound } from "@store-demo/core";
import { Badge, PriceTag, ProductGrid, Typography } from "@store-demo/ui";

import { toIntlLocale } from "@/i18n/intl-locale";
import { getProductBySlug, getProducts } from "@/features/products/api/products.api";
import { AddToCartButton } from "@/features/products/components/AddToCartButton";
import { ProductCardLink } from "@/features/products/components/ProductCardLink";
import { getRelatedProducts } from "@/features/products/services/get-related-products";
import { getStockBadge } from "@/features/products/services/get-stock-badge";
import { SITE_URL } from "@/lib/site-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
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

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  // getProducts() es solo para "también te puede interesar" — un fallo ahí
  // no debe romper la página de un producto que sí existe y se resolvió
  // bien, así que su error se aísla del de fetchOrNotFound (que si no,
  // haría fallar Promise.all entero y mostraría un error genérico en vez
  // del producto real).
  const [product, allProducts, t] = await Promise.all([
    fetchOrNotFound(getProductBySlug({ slug })),
    getProducts().catch(() => []),
    getTranslations("products"),
  ]);

  const stockBadge = getStockBadge(product.stock, {
    outOfStock: t("outOfStock"),
    lowStock: t("lowStock"),
  });
  const relatedProducts = getRelatedProducts(allProducts, product);
  // localePrefix "as-needed": español sin prefijo, inglés con /en (mismo
  // criterio que apps/storefront/src/app/sitemap.ts).
  const localePath = locale === "en" ? "/en" : "";
  const productUrl = `${SITE_URL}${localePath}/products/${product.slug}`;
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
          {
            "@type": "ListItem",
            position: 1,
            name: t("breadcrumbHome"),
            item: `${SITE_URL}${localePath}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: t("breadcrumbCatalog"),
            item: `${SITE_URL}${localePath}/products`,
          },
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
          <PriceTag amountCents={product.priceCents} size="lg" locale={toIntlLocale(locale)} />
          <Typography variant="body" className="text-gray-600">
            {product.description}
          </Typography>
          <AddToCartButton productId={product.id} maxQuantity={product.stock} />
        </div>
      </main>
      {relatedProducts.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-10">
          <Typography as="h2" variant="heading" className="mb-4">
            {t("relatedTitle")}
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
