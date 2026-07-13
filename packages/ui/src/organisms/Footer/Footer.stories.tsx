import type { Meta, StoryObj } from "@storybook/react-vite";

import { Typography } from "../../atoms/Typography";
import { VersionBadge } from "../../atoms/VersionBadge";
import { Footer } from "./Footer";

const meta = {
  title: "Organisms/Footer",
  component: Footer,
  args: {
    brandSlot: (
      <>
        <Typography as="span" variant="heading" className="text-lg sm:text-lg text-white">
          Store Demo
        </Typography>
        <Typography variant="body" className="mt-2 text-sm text-gray-400">
          Proyecto de portfolio que demuestra un stack profesional de frontend: React, Next.js,
          TypeScript, Zod, TanStack Query y Zustand.
        </Typography>
      </>
    ),
    columns: [
      {
        heading: "Tienda",
        links: (
          <>
            <a href="/">Inicio</a>
            <a href="/products">Catálogo</a>
            <a href="/products?category=camisetas">Camisetas</a>
            <a href="/products?category=gorras">Gorras</a>
            <a href="/products?category=zapatillas">Zapatillas</a>
          </>
        ),
      },
      {
        heading: "Cuenta",
        links: (
          <>
            <a href="/login">Iniciar sesión</a>
            <a href="/register">Crear cuenta</a>
          </>
        ),
      },
    ],
    bottomStart: <span>© {new Date().getFullYear()} Store Demo. Proyecto de portfolio.</span>,
    bottomEnd: (
      <>
        <a href="https://github.com/afranco83/store-demo" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <VersionBadge version="1.0.1" href="#" className="text-gray-500 hover:text-white" />
      </>
    ),
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleColumn: Story = {
  args: {
    columns: [
      {
        heading: "Tienda",
        links: (
          <>
            <a href="/">Inicio</a>
            <a href="/products">Catálogo</a>
          </>
        ),
      },
    ],
  },
};
