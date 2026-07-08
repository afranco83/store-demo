export const colors = {
  accent: "#c2410c",
  accentHover: "#9a3412",
  accentForeground: "#ffffff",
  accentSoft: "rgb(194 65 12 / 10%)",
} as const;

// El acento base no llega a AA sobre fondos oscuros (ver tokens.css); esta
// variante es la única parte de la paleta con contraparte dark hoy.
export const colorsDark = {
  accent: "#f0672a",
  accentHover: "#f38250",
  accentForeground: "#17110c",
  accentSoft: "rgb(240 103 42 / 18%)",
} as const;

export const fonts = {
  display: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
} as const;
