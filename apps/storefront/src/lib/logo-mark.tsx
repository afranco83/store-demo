import { ImageResponse } from "next/og";

// Mismo acento de marca que el Hero/opengraph-image, hardcodeado por la
// misma razón (Satori no tiene acceso a las custom properties de
// packages/design-tokens).
const ACCENT = "#c2410c";
const ACCENT_FOREGROUND = "#ffffff";

export function renderLogoMark(size: number) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: ACCENT,
        color: ACCENT_FOREGROUND,
        fontSize: size * 0.6,
        fontWeight: 700,
      }}
    >
      S
    </div>,
    { width: size, height: size },
  );
}
