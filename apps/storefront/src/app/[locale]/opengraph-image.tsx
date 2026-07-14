import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const alt = "Store Demo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mismo par de colores que el gradiente del Hero (packages/design-tokens),
// hardcodeado porque ImageResponse renderiza vía Satori, no vía Tailwind/CSS
// real — no hay acceso a las custom properties de packages/design-tokens.
const ACCENT_FROM = "#c2410c";
const ACCENT_TO = "#9a3412";
const ACCENT_FOREGROUND = "#ffffff";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 24,
        padding: "0 96px",
        background: `linear-gradient(135deg, ${ACCENT_FROM}, ${ACCENT_TO})`,
        color: ACCENT_FOREGROUND,
      }}
    >
      <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>
        {t("heroEyebrow")}
      </div>
      <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{t("heroTitle")}</div>
      <div style={{ fontSize: 32, opacity: 0.9, maxWidth: 800 }}>{t("heroDescription")}</div>
    </div>,
    { ...size },
  );
}
