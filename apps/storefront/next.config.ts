import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { NextConfig } from "next";

const rootPackageJson = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "../../package.json"), "utf-8"),
) as { version: string };

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: rootPackageJson.version,
    // Mismo fallback que apps/storefront/src/lib/site-url.ts — inyectado
    // aquí para que esté disponible incluso sin configurar la env var real
    // en Vercel (igual que NEXT_PUBLIC_APP_VERSION de arriba).
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://store-demo-storefront-kappa.vercel.app",
  },
  transpilePackages: [
    "@store-demo/ui",
    "@store-demo/shared-types",
    "@store-demo/api-client",
    "@store-demo/core",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/ed33klzl/image/upload/**",
      },
      // Cuenta "demo" pública de Cloudinary (sin autenticación): usada solo
      // por prisma/seed-lighthouse.ts (Fase 8) para no depender de
      // Unsplash/Cloudinary reales en el workflow de Lighthouse CI. Prefijo
      // explícito, no un comodín abierto (AGENTS.md §9).
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/demo/image/upload/**",
      },
    ],
  },
};

export default nextConfig;
