import Link from "next/link";
import { Footer, Typography, VersionBadge } from "@store-demo/ui";
import { auth } from "@store-demo/auth";

import { getCategories } from "@/features/products/api/categories.api";

const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";

export async function SiteFooter() {
  // allSettled, no all: el footer se monta en el root layout de todas las
  // páginas — un fallo de sesión o de apps/api aquí no debe tumbar el sitio
  // entero (no hay global-error.tsx que lo cubra). Se degrada mostrando el
  // footer sin esas secciones en vez de propagar el error.
  const [sessionResult, categoriesResult] = await Promise.allSettled([auth(), getCategories()]);
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
            Proyecto de portfolio que demuestra un stack profesional de frontend: React, Next.js,
            TypeScript, Zod, TanStack Query y Zustand.
          </Typography>
        </>
      }
      columns={[
        {
          heading: "Tienda",
          links: (
            <>
              <Link href="/">Inicio</Link>
              <Link href="/products">Catálogo</Link>
              {categories.map((category) => (
                <Link key={category.id} href={`/products?category=${category.slug}`}>
                  {category.name}
                </Link>
              ))}
            </>
          ),
        },
        {
          heading: "Cuenta",
          links: session ? (
            <>
              <Link href="/account">Mi cuenta</Link>
              <Link href="/account/orders">Mis pedidos</Link>
            </>
          ) : (
            <>
              <Link href="/login">Iniciar sesión</Link>
              <Link href="/register">Crear cuenta</Link>
            </>
          ),
        },
      ]}
      bottomStart={<span>© {new Date().getFullYear()} Store Demo. Proyecto de portfolio.</span>}
      bottomEnd={
        <>
          <a
            href="https://github.com/afranco83/store-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 transition-colors hover:text-accent-on-dark"
          >
            GitHub
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
