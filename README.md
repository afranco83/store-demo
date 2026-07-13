# Store Demo — Frontend Architecture Showcase

[![CI](https://github.com/afranco83/store-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/afranco83/store-demo/actions/workflows/ci.yml)
[![Lighthouse CI](https://github.com/afranco83/store-demo/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/afranco83/store-demo/actions/workflows/lighthouse.yml)
[![Release](https://github.com/afranco83/store-demo/actions/workflows/release.yml/badge.svg)](https://github.com/afranco83/store-demo/actions/workflows/release.yml)
[![Latest release](https://img.shields.io/github/v/release/afranco83/store-demo)](https://github.com/afranco83/store-demo/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Monorepo demo que replica un stack y unas prácticas de ingeniería frontend profesionales (React, Next.js, TypeScript, Zod, TanStack Query, Zustand, Turborepo...). No es un producto real: es un entorno controlado para demostrar arquitectura, testing, accesibilidad, performance y DX de nivel profesional.

## Demo pública

- 🛍️ **Storefront**: [store-demo-storefront-kappa.vercel.app](https://store-demo-storefront-kappa.vercel.app)
- 🛠️ **Admin**: [store-demo-admin.vercel.app](https://store-demo-admin.vercel.app)
- 🔌 **API**: [store-demo-api.vercel.app](https://store-demo-api.vercel.app)

Usuarios demo (contraseña `Password123!`): `customer1@store-demo.test` / `customer2@store-demo.test` (clientes), `admin@store-demo.test` (rol admin, entra en el panel de `admin`). Desplegado en Vercel con [Turso](https://turso.tech) (libSQL) como base de datos — detalle de la decisión en [`docs/ARCHITECTURE.md` §7](./docs/ARCHITECTURE.md). Estas credenciales son intencionadamente públicas para que cualquiera pueda probar la demo; el dataset de producción (pedidos/productos/categorías) se restaura automáticamente cada 6h ([`reset-demo-data.yml`](./.github/workflows/reset-demo-data.yml)) para que cualquier cambio hecho desde el panel de `admin` sea temporal.

## Por qué existe este proyecto

Es una pieza de portfolio, no un producto con usuarios reales. El objetivo es demostrar, sobre un caso de uso concreto (una tienda online), decisiones y prácticas de un equipo de frontend profesional: arquitectura de monorepo, type safety end-to-end (Zod + TypeScript, del backend fake al componente), un design system con Storybook, testing en tres capas (unit/integración/E2E), accesibilidad WCAG 2.1 AA y un pipeline de CI/CD cuidado. El detalle completo está en [`docs/PROJECT_SPECIFICATION.md`](./docs/PROJECT_SPECIFICATION.md).

**Estado actual: roadmap completo cerrado, incluida la demo pública (2026-07-13).** `apps/storefront` cubre el flujo de compra completo (catálogo, carrito con invitado/fusión al loguearse, cuenta, checkout de 3 pasos) y `apps/admin` es la segunda app de negocio (CRUD de productos/categorías, gestión de pedidos, rol `admin`). `packages/ui` documenta en `apps/storybook` todo el inventario de componentes. Detalle completo por fase en [`docs/ROADMAP.md`](./docs/ROADMAP.md).

**Repositorio**: [github.com/afranco83/store-demo](https://github.com/afranco83/store-demo).

## Qué puedes probar

Con `apps/api` levantado (ver "Cómo arrancar"):

**`apps/storefront` (`:3000`)**

- **Catálogo**: `/products`, filtrado por categoría, detalle de producto.
- **Carrito**: añade productos sin sesión (invitado) o logueado; se fusiona automáticamente al iniciar sesión.
- **Cuenta**: `/register` / `/login`, edición de nombre/email, historial de pedidos en `/account/orders`.
- **Checkout**: `/checkout` (o el botón "Finalizar compra" del carrito) — dirección de envío, pago simulado y confirmación. Cualquier tarjeta de 16 dígitos funciona salvo que termine en `1`, que fuerza un rechazo simulado a propósito para probar el camino de error.

**`apps/admin` (`:3001`)**, solo con la cuenta admin:

- **Catálogo**: CRUD de productos y categorías (`/products`, `/categories`).
- **Pedidos**: `/orders` — listado y cambio de estado.

Usuarios demo ya seedeados (contraseña `Password123!`): `customer1@store-demo.test`, `customer2@store-demo.test`, `admin@store-demo.test` (rol admin).

## Stack tecnológico

| Categoría               | Tecnología                                           |
| ----------------------- | ---------------------------------------------------- |
| Core                    | React, Next.js (App Router), TypeScript              |
| Monorepo                | pnpm, Turborepo                                      |
| Estado servidor/cliente | TanStack Query, Zustand, Context API                 |
| Validación/formularios  | Zod, React Hook Form + Zod Resolver                  |
| Backend fake            | Next.js Route Handlers, Prisma, SQLite               |
| Auth                    | Auth.js (NextAuth) v5                                |
| Estilos                 | Tailwind CSS v4 (CSS-first), `cva`, `tailwind-merge` |
| Testing                 | Vitest, Testing Library, MSW, Playwright + axe       |
| Documentación viva      | Storybook 10 + addon-a11y                            |
| Calidad                 | ESLint, Prettier, Husky, lint-staged, commitlint     |
| CI/CD                   | GitHub Actions                                       |

Justificación de cada elección en [`docs/PROJECT_SPECIFICATION.md` §2](./docs/PROJECT_SPECIFICATION.md).

## Estructura del monorepo

- **apps/**: `storefront` (tienda pública, `:3000`), `admin` (panel de administración, `:3001`), `api` (backend fake, solo Route Handlers, `:4000`), `storybook` (design system, `:6006`), `playground` (sandbox)
- **packages/**: `ui`, `design-tokens`, `tailwind-config`, `auth`, `api-client`, `shared-types`, `core`, `testing`, `eslint-config`, `tsconfig`

Cada app/paquete tiene su propio `README.md` con detalle específico (rutas, variables de entorno, cómo verificarlo en aislado).

## Cómo arrancar

```bash
pnpm install
cp apps/api/.env.example apps/api/.env   # y rellena los valores reales
# UNSPLASH_ACCESS_KEY: cuenta gratuita de developer en unsplash.com/developers (solo el Access Key, no el Secret Key)
cp apps/storefront/.env.example apps/storefront/.env
# AUTH_SECRET: cifra la cookie de sesión de Auth.js — genera uno con `npx auth secret` o `openssl rand -base64 32`

cp apps/admin/.env.example apps/admin/.env
# AUTH_SECRET: genera uno propio, independiente del de storefront (cada app
# corre en su propio origen/puerto, sin compartir cookies)

pnpm --filter @store-demo/api exec prisma migrate dev
pnpm --filter @store-demo/api exec prisma db seed

pnpm turbo dev --filter=@store-demo/api          # backend fake en :4000
pnpm turbo dev --filter=@store-demo/storefront   # storefront en :3000
pnpm turbo dev --filter=@store-demo/admin        # panel admin en :3001
pnpm --filter @store-demo/storybook dev          # design system en :6006
```

## Cómo verificar

```bash
pnpm turbo lint typecheck test build --force   # gate completo, igual que en CI (sin caché)
pnpm turbo test                                # solo tests unitarios/integración (Vitest)
pnpm turbo test:e2e --concurrency=1             # specs E2E (Playwright), requiere apps/api levantado
pnpm --filter @store-demo/storefront exec lhci autorun   # Lighthouse, requiere build de producción
```

Cobertura de test exigida (`AGENTS.md §6`): ≥80% en `packages/ui` (85%), `packages/api-client`, `packages/shared-types`, `packages/auth`, `apps/api` y `features/**/{hooks,services,store,lib,schemas}` de cada app — en la práctica, la mayoría de paquetes está por encima del 95%. Cifras exactas y actualizadas por fase en [`docs/ROADMAP.md`](./docs/ROADMAP.md) (evita que este README quede desincronizado cada vez que cambian).

## Documentación

- [`docs/PROJECT_SPECIFICATION.md`](./docs/PROJECT_SPECIFICATION.md) — objetivo, stack, principios, estructura del monorepo
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — decisiones técnicas detalladas (backend fake, auth, design system, testing, CI/CD)
- [`docs/ROADMAP.md`](./docs/ROADMAP.md) — fases, tareas y criterios de aceptación
- [`docs/adr/`](./docs/adr/) — decisiones de arquitectura individuales (formato MADR), para las de mayor impacto
- [`AGENTS.md`](./AGENTS.md) — convenciones de código (válido para cualquier herramienta de codificación)
- [`CLAUDE.md`](./CLAUDE.md) — contexto operativo del repo para Claude Code, incluidos los agentes/skills ya creados en `.claude/` (2 agentes + 7 skills)

## Autoría y licencia

Creado y mantenido por [Aurelio Franco Fernández](https://github.com/afranco83). Publicado bajo licencia [MIT](./LICENSE).
