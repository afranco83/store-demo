import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "./globals.css";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CartDrawerContainer } from "@/features/cart/components/CartDrawerContainer";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-url";
import { QueryProvider } from "@/providers/QueryProvider";

// next-intl usa "es_ES"/"en_US" (BCP 47 con región) para openGraph.locale,
// distinto del `lang`/locale corto ("es"/"en") que maneja el resto de la app.
const OPEN_GRAPH_LOCALES: Record<string, string> = { es: "es_ES", en: "en_US" };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: "Store Demo", template: "%s | Store Demo" },
    description: t("siteDescription"),
    openGraph: {
      siteName: "Store Demo",
      locale: OPEN_GRAPH_LOCALES[locale],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Habilita hooks estáticos (useTranslations en Server Components sin
  // pasar el locale explícito) para el resto del árbol de esta request.
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <QueryProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
            <CartDrawerContainer />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
