import { Typography } from "@store-demo/ui";

import { getProducts } from "@/features/products/api/products.api";
import { ProductGridSection } from "@/features/products/components/ProductGridSection";

const FEATURED_PRODUCTS_LIMIT = 8;

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <Typography as="h1" variant="display">
          Store Demo
        </Typography>
        <Typography variant="body" className="text-gray-600">
          Streetwear con estilo: camisetas, gorras y zapatillas.
        </Typography>
      </div>
      <ProductGridSection products={products.slice(0, FEATURED_PRODUCTS_LIMIT)} />
    </main>
  );
}
