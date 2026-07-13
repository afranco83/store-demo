import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "./globals.css";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CartDrawerContainer } from "@/features/cart/components/CartDrawerContainer";
import { SITE_URL } from "@/lib/site-url";
import { QueryProvider } from "@/providers/QueryProvider";

const DESCRIPTION = "Tienda online demo — showcase de arquitectura frontend profesional.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Store Demo", template: "%s | Store Demo" },
  description: DESCRIPTION,
  openGraph: {
    siteName: "Store Demo",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <QueryProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <CartDrawerContainer />
        </QueryProvider>
      </body>
    </html>
  );
}
