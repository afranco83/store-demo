import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Typography } from "@store-demo/ui";

import { getCategories } from "@/features/products/api/categories.api";
import { getProducts } from "@/features/products/api/products.api";
import { CategoryFilterNav } from "@/features/products/components/CategoryFilterNav";
import { ProductGridSection } from "@/features/products/components/ProductGridSection";
import { productsSearchParamsSchema } from "@/features/products/schemas/products-search-params.schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products" });
  const title = t("catalogTitle");
  const description = t("catalogDescription");

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawSearchParams = await searchParams;
  const { category } = productsSearchParamsSchema.parse({
    category: typeof rawSearchParams.category === "string" ? rawSearchParams.category : undefined,
  });

  const [categories, products, t] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: category }),
    getTranslations("products"),
  ]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="heading">
        {t("catalogTitle")}
      </Typography>
      <CategoryFilterNav categories={categories} activeCategorySlug={category} />
      <ProductGridSection products={products} />
    </main>
  );
}
