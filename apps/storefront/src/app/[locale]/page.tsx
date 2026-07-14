import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buttonVariants, Hero } from "@store-demo/ui";

import { Link } from "@/i18n/navigation";
import { getProducts } from "@/features/products/api/products.api";
import { ProductGridSection } from "@/features/products/components/ProductGridSection";

const FEATURED_PRODUCTS_LIMIT = 8;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

// Sin esto, el `revalidate: 60` de getProducts() hace que Next intente
// pre-renderizar esta página en build time — funciona en local porque
// apps/api ya está levantado, pero revienta en CI (no hay backend real
// corriendo durante `next build`). Igual que /products y /products/[slug],
// que ya son dinámicas por usar searchParams/params.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, t] = await Promise.all([getProducts(), getTranslations("home")]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <Hero
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        description={t("heroDescription")}
        action={
          <Link href="/products" className={buttonVariants({ intent: "secondary", size: "lg" })}>
            {t("viewCatalog")}
          </Link>
        }
      />
      <ProductGridSection products={products.slice(0, FEATURED_PRODUCTS_LIMIT)} />
    </main>
  );
}
