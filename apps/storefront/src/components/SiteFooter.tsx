import { getTranslations } from "next-intl/server";
import { Footer, Typography, VersionBadge } from "@store-demo/ui";
import { auth } from "@store-demo/auth";

import { Link } from "@/i18n/navigation";
import { getCategories } from "@/features/products/api/categories.api";
import { LocaleSwitcherContainer } from "./LocaleSwitcherContainer";

const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";

export async function SiteFooter() {
  // allSettled, no all: el footer se monta en el root layout de todas las
  // páginas — un fallo de sesión o de apps/api aquí no debe tumbar el sitio
  // entero (no hay global-error.tsx que lo cubra). Se degrada mostrando el
  // footer sin esas secciones en vez de propagar el error.
  const [sessionResult, categoriesResult, t, tNav] = await Promise.all([
    auth().then(
      (session) => ({ status: "fulfilled" as const, value: session }),
      () => ({ status: "rejected" as const }),
    ),
    getCategories().then(
      (categories) => ({ status: "fulfilled" as const, value: categories }),
      () => ({ status: "rejected" as const }),
    ),
    getTranslations("footer"),
    getTranslations("nav"),
  ]);
  const session = sessionResult.status === "fulfilled" ? sessionResult.value : null;
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];

  return (
    <Footer
      brandSlot={
        <>
          <Link href="/">
            <Typography as="span" variant="heading" className="text-lg sm:text-lg text-white">
              Store Demo
            </Typography>
          </Link>
          <Typography variant="body" className="mt-2 text-sm text-gray-400">
            {t("tagline")}
          </Typography>
        </>
      }
      columns={[
        {
          heading: t("storeHeading"),
          links: (
            <>
              <Link href="/">{tNav("home")}</Link>
              <Link href="/products">{tNav("catalog")}</Link>
              {categories.map((category) => (
                // Objeto {pathname, query}, no un string con "?" — ver el
                // mismo comentario en CategoryFilterNav.tsx.
                <Link
                  key={category.id}
                  href={{ pathname: "/products", query: { category: category.slug } }}
                >
                  {category.name}
                </Link>
              ))}
            </>
          ),
        },
        {
          heading: t("accountHeading"),
          links: session ? (
            <>
              <Link href="/account">{tNav("myAccount")}</Link>
              <Link href="/account/orders">{tNav("myOrders")}</Link>
            </>
          ) : (
            <>
              <Link href="/login">{t("login")}</Link>
              <Link href="/register">{t("register")}</Link>
            </>
          ),
        },
      ]}
      bottomStart={<span>{t("copyright", { year: new Date().getFullYear() })}</span>}
      bottomEnd={
        <>
          <LocaleSwitcherContainer />
          <a
            href="https://github.com/afranco83/store-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 transition-colors hover:text-accent-on-dark"
          >
            {t("github")}
          </a>
          <VersionBadge
            version={version}
            href={`https://github.com/afranco83/store-demo/releases/tag/v${version}`}
            // El text-gray-500 por defecto de VersionBadge (pensado para
            // fondos claros) da 3.67:1 sobre el bg-gray-900 del footer —
            // falla AA (4.5:1). gray-400 da 6.82:1 (verificado con axe real
            // en CI, no solo cálculo manual).
            className="text-gray-400 hover:text-white"
          />
        </>
      }
    />
  );
}
