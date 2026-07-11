"use client";

import Link from "next/link";
import { ProductCard } from "@store-demo/ui";
import type { Product } from "@store-demo/shared-types";

import { useAddToCartMutation } from "../../cart/hooks/use-add-to-cart-mutation";
import { useCartDrawerStore } from "../../cart/store/use-cart-drawer-store";
import { buildCloudinaryThumbnailUrl } from "../services/build-cloudinary-thumbnail-url";
import { getStockBadge } from "../services/get-stock-badge";

const THUMBNAIL_WIDTH_PX = 480;

export function ProductCardLink({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const addToCartMutation = useAddToCartMutation();
  const openCartDrawer = useCartDrawerStore((state) => state.open);

  return (
    <div className="relative">
      {/* "Stretched link": overlay que cubre toda la card para que sea
          navegable en cualquier punto, sin anidar el botón de añadir al
          carrito dentro de un <a> (HTML inválido). ProductCard ya tiene un
          contenedor "position: relative" propio (para el badge sobre la
          imagen), que compite por defecto al mismo nivel de stacking que
          este overlay (z-index: auto) y gana por estar más profundo en el
          árbol — de ahí el z-index explícito, por debajo del botón (z-10). */}
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-[1]"
        aria-label={product.name}
      />
      <ProductCard
        name={product.name}
        imageUrl={buildCloudinaryThumbnailUrl(product.imageUrl, THUMBNAIL_WIDTH_PX)}
        priceCents={product.priceCents}
        stockBadge={getStockBadge(product.stock)}
        addToCartLabel="Añadir al carrito"
        priority={priority}
        onAddToCart={
          product.stock > 0
            ? () =>
                addToCartMutation.mutate(
                  { productId: product.id, quantity: 1 },
                  { onSuccess: () => openCartDrawer() },
                )
            : undefined
        }
      />
    </div>
  );
}
