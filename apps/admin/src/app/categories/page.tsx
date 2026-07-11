import Link from "next/link";
import { Typography, buttonVariants } from "@store-demo/ui";
import { getCategories } from "@store-demo/api-client";

import { CategoriesTable } from "@/features/categories/components/CategoriesTable";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <Typography as="h1" variant="display">
          Categorías
        </Typography>
        <Link href="/categories/new" className={buttonVariants({ intent: "primary" })}>
          Nueva categoría
        </Link>
      </div>
      <CategoriesTable categories={categories} />
    </main>
  );
}
