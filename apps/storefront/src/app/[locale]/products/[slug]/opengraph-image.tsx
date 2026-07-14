import { ImageResponse } from "next/og";
import { ApiClientError } from "@store-demo/api-client";

import { toIntlLocale } from "@/i18n/intl-locale";
import { getProductBySlug } from "@/features/products/api/products.api";
import DefaultOgImage from "../../opengraph-image";

export const alt = "Producto de Store Demo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const currencyFormatter = new Intl.NumberFormat(toIntlLocale(locale), {
    style: "currency",
    currency: "EUR",
  });
  // Reusa la foto Cloudinary real del producto (ya vetada en el seed) — no
  // se introduce ninguna fuente de imagen nueva, mismo criterio que el Hero.
  let product;
  try {
    product = await getProductBySlug({ slug });
  } catch (error) {
    // Slug borrado/inexistente (p. ej. un crawler reintentando una URL
    // vieja): no hay producto que mostrar, se cae al banner genérico de
    // marca en vez de dejar pasar un 500 sin controlar.
    if (error instanceof ApiClientError && error.status === 404) {
      return DefaultOgImage({ params });
    }
    throw error;
  }

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffffff" }}>
      <div style={{ width: "50%", height: "100%", display: "flex" }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div
        style={{
          width: "50%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 16,
          padding: "0 64px",
          color: "#111827",
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "#c2410c",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          Store Demo
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>{product.name}</div>
        <div style={{ fontSize: 40, fontWeight: 600 }}>
          {currencyFormatter.format(product.priceCents / 100)}
        </div>
      </div>
    </div>,
    { ...size },
  );
}
