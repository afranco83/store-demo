import type { ReactNode } from "react";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "./globals.css";

import { SiteHeader } from "@/components/SiteHeader";
import { CartDrawerContainer } from "@/features/cart/components/CartDrawerContainer";
import { QueryProvider } from "@/providers/QueryProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <QueryProvider>
          <SiteHeader />
          {children}
          <CartDrawerContainer />
        </QueryProvider>
      </body>
    </html>
  );
}
