import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
