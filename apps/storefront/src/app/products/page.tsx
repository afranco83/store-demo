import type { Metadata } from "next";
import { Typography } from "@store-demo/ui";

import { getCategories } from "@/features/products/api/categories.api";
import { getProducts } from "@/features/products/api/products.api";
import { CategoryFilterNav } from "@/features/products/components/CategoryFilterNav";
import { ProductGridSection } from "@/features/products/components/ProductGridSection";
import { productsSearchParamsSchema } from "@/features/products/schemas/products-search-params.schema";

const TITLE = "Catálogo";
const DESCRIPTION = "Explora el catálogo completo de camisetas, gorras y zapatillas.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawSearchParams = await searchParams;
  const { category } = productsSearchParamsSchema.parse({
    category: typeof rawSearchParams.category === "string" ? rawSearchParams.category : undefined,
  });

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: category }),
  ]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="heading">
        {TITLE}
      </Typography>
      <CategoryFilterNav categories={categories} activeCategorySlug={category} />
      <ProductGridSection products={products} />
    </main>
  );
}
