import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "./globals.css";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CartDrawerContainer } from "@/features/cart/components/CartDrawerContainer";
import { QueryProvider } from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: { default: "Store Demo", template: "%s | Store Demo" },
  description: "Tienda online demo — showcase de arquitectura frontend profesional.",
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
