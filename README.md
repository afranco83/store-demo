# Store Demo — Frontend Architecture Showcase

[![CI](https://github.com/afranco83/store-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/afranco83/store-demo/actions/workflows/ci.yml)

Monorepo demo que replica un stack y unas prácticas de ingeniería frontend profesionales (React, Next.js, TypeScript, Zod, TanStack Query, Zustand, Turborepo...). No es un producto real: es un entorno controlado para demostrar arquitectura, testing, accesibilidad, performance y DX de nivel profesional.

**Estado actual: Fase 2 — Backend Fake & Contratos (cerrada).** `apps/api` (Prisma + SQLite) expone CRUD de productos/categorías/carrito/pedidos y login, con contratos Zod compartidos (`packages/shared-types`) y un `api-client` tipado y testeado (MSW + Vitest, cobertura 100%); siguiente fase: Design System (Base).

**Repositorio**: [github.com/afranco83/store-demo](https://github.com/afranco83/store-demo).

## Estructura del monorepo

- **apps/**: `storefront` (tienda pública), `admin` (panel), `api` (backend fake, solo Route Handlers), `storybook` (design system, placeholder hasta Fase 3), `playground` (sandbox)
- **packages/**: `ui`, `design-tokens`, `tailwind-config`, `auth`, `api-client`, `shared-types`, `core`, `testing`, `eslint-config`, `tsconfig`

## Cómo arrancar

```bash
pnpm install
cp apps/api/.env.example apps/api/.env   # y rellena los valores reales

pnpm --filter @store-demo/api exec prisma migrate dev
pnpm --filter @store-demo/api exec prisma db seed

pnpm turbo lint typecheck test build   # verifica todo el monorepo
pnpm turbo dev --filter=@store-demo/api        # backend fake en :4000
pnpm turbo dev --filter=storefront
```

## Documentación

- [`docs/PROJECT_SPECIFICATION.md`](./docs/PROJECT_SPECIFICATION.md) — objetivo, stack, principios, estructura del monorepo
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — decisiones técnicas detalladas (backend fake, auth, design system, testing, CI/CD)
- [`docs/ROADMAP.md`](./docs/ROADMAP.md) — fases, tareas y criterios de aceptación
- [`AGENTS.md`](./AGENTS.md) — convenciones de código (válido para cualquier herramienta de codificación)
- [`CLAUDE.md`](./CLAUDE.md) — contexto y agentes/skills planificados específicos de Claude Code
