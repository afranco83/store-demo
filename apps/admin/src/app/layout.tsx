import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "./globals.css";

import { AdminHeader } from "@/components/AdminHeader";

export const metadata: Metadata = {
  title: { default: "Store Demo Admin", template: "%s | Store Demo Admin" },
  description: "Panel de administración de catálogo y pedidos de Store Demo.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AdminHeader />
        {children}
      </body>
    </html>
  );
}
