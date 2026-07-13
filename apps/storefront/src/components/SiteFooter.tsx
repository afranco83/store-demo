import Link from "next/link";
import { Footer, Typography, VersionBadge } from "@store-demo/ui";
import { auth } from "@store-demo/auth";

import { getCategories } from "@/features/products/api/categories.api";

const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";

export async function SiteFooter() {
  const [session, categories] = await Promise.all([auth(), getCategories()]);

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
          >
            GitHub
          </a>
          <VersionBadge
            version={version}
            href={`https://github.com/afranco83/store-demo/releases/tag/v${version}`}
            className="text-gray-500 hover:text-white"
          />
        </>
      }
    />
  );
}
