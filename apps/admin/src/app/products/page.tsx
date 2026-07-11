import type { Metadata } from "next";
import Link from "next/link";
import { Typography, buttonVariants } from "@store-demo/ui";
import { getCategories, getProducts } from "@store-demo/api-client";

import { ProductsTable } from "@/features/products/components/ProductsTable";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Productos" };

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <Typography as="h1" variant="display">
          Productos
        </Typography>
        <Link href="/products/new" className={buttonVariants({ intent: "primary" })}>
          Nuevo producto
        </Link>
      </div>
      <ProductsTable products={products} categories={categories} />
    </main>
  );
}
