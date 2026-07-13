import { ImageResponse } from "next/og";

import { getProductBySlug } from "@/features/products/api/products.api";

export const alt = "Producto de Store Demo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const currencyFormatter = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Reusa la foto Cloudinary real del producto (ya vetada en el seed) — no
  // se introduce ninguna fuente de imagen nueva, mismo criterio que el Hero.
  const product = await getProductBySlug({ slug });

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
