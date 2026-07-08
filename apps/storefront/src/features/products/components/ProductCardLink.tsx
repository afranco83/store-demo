import Link from "next/link";
import { ProductCard } from "@store-demo/ui";
import type { Product } from "@store-demo/shared-types";

import { getStockBadge } from "../services/get-stock-badge";

export function ProductCardLink({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="block">
      <ProductCard
        name={product.name}
        imageUrl={product.imageUrl}
        priceCents={product.priceCents}
        stockBadge={getStockBadge(product.stock)}
      />
    </Link>
  );
}
