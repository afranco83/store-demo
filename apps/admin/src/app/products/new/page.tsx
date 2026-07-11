import { Typography } from "@store-demo/ui";
import { getCategories } from "@store-demo/api-client";

import { ProductForm } from "@/features/products/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <Typography as="h1" variant="display">
        Nuevo producto
      </Typography>
      <ProductForm categories={categories} />
    </main>
  );
}
