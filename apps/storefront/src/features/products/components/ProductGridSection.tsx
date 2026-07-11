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
      {products.map((product, index) => (
        // Solo la primera card (candidata real a LCP) se marca priority —
        // medido con Lighthouse (Fase 8): marcar varias con fetchPriority
        // "high" a la vez compite por ancho de banda con la propia imagen
        // LCP y empeora el resultado en vez de mejorarlo.
        <ProductCardLink key={product.id} product={product} priority={index === 0} />
      ))}
    </ProductGrid>
  );
}
