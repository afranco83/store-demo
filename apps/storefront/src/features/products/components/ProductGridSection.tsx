import { PackageSearch } from "lucide-react";
import { EmptyState, ProductGrid } from "@store-demo/ui";
import type { Product } from "@store-demo/shared-types";

import { ProductCardLink } from "./ProductCardLink";

export function ProductGridSection({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No hay productos en esta categoría"
        description="Prueba a elegir otra categoría del catálogo."
      />
    );
  }

  return (
    <ProductGrid>
      {products.map((product) => (
        <ProductCardLink key={product.id} product={product} />
      ))}
    </ProductGrid>
  );
}
