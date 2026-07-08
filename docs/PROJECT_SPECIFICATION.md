# Frontend Architecture Showcase — Store Demo

## Especificación del Proyecto v1.0

> Evoluciona `PROJECT_SPECIFICATION_v0.1.md`. Este documento es la fuente de verdad para el **qué** y el **por qué** del proyecto. El **cómo** detallado de cada decisión técnica vive en [`ARCHITECTURE.md`](./ARCHITECTURE.md) y la planificación temporal en [`ROADMAP.md`](./ROADMAP.md). Las convenciones de código a seguir durante la implementación están en [`AGENTS.md`](../AGENTS.md).

---

## 1. Objetivo

Construir un monorepo moderno que sirva como demostración práctica de conocimientos avanzados de desarrollo frontend, replicando las prácticas, herramientas y estándares de un equipo profesional de ingeniería frontend en el ecosistema React.

El proyecto demuestra:

- Arquitectura escalable y mantenible (monorepo, domain-driven frontend)
- Diseño de sistemas UI (design tokens, atomic design, Storybook)
- Type Safety end-to-end (TypeScript + Zod, del backend fake al componente)
- Testing en las tres capas (unit, integración, E2E)
- Accesibilidad (WCAG 2.1 AA)
- Performance (Core Web Vitals, presupuestos de rendimiento)
- Developer Experience (tooling, linting, CI/CD, generación de código)
- Gestión de monorepos con Turborepo + pnpm

### 1.1 No-objetivos (fuera de alcance explícito)

Para evitar sobre-ingeniería, quedan **fuera de v1**:

- Persistencia de datos real en producción (pagos, PII real, cumplimiento legal)
- Internacionalización (i18n) — candidato a fase futura si se decide ampliar
- Feature flags / experimentación
- Analítica de producto
- Multi-tenant o white-labeling

Estas exclusiones se revisan al cierre de la Fase 8 (ver `ROADMAP.md`); no son una prohibición permanente, sino una decisión consciente de foco.

---

## 2. Stack Tecnológico

| Categoría                          | Tecnología                                                                                                                | Justificación                                                                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core                               | React, Next.js (App Router), TypeScript                                                                                   | Estándar de facto en el ecosistema profesional; App Router permite demostrar Server/Client Components                                                   |
| Monorepo                           | pnpm, Turborepo                                                                                                           | Gestión de workspaces eficiente + caché de tareas y pipelines                                                                                           |
| Estado servidor                    | TanStack Query                                                                                                            | Cache, invalidación y sincronización de datos remotos                                                                                                   |
| Estado cliente                     | Zustand                                                                                                                   | Estado de UI/cliente mutable con lógica de actualización, sin acoplarse a datos remotos                                                                 |
| Inyección de dependencias / config | Context API (React)                                                                                                       | Valores semi-estáticos compartidos en un subárbol (tema, sesión, futura configuración de i18n), sin lógica de actualización compleja                    |
| Validación                         | Zod                                                                                                                       | Esquema único de validación reutilizado en formularios, API y contratos backend/frontend                                                                |
| Formularios                        | React Hook Form + Zod Resolver                                                                                            | Formularios performantes con validación tipada                                                                                                          |
| Backend fake                       | Next.js Route Handlers + Prisma + SQLite                                                                                  | Backend real (no mocks) para demostrar contratos API completos; ver `ARCHITECTURE.md` §3                                                                |
| Auth                               | Auth.js (NextAuth) v5                                                                                                     | Gestión de sesión/roles estándar en Next.js                                                                                                             |
| Testing unit/integración           | Vitest, Testing Library, MSW                                                                                              | MSW se usa en tests (no en dev/demo, donde el backend fake es real)                                                                                     |
| Testing E2E                        | Playwright (+ `@axe-core/playwright`)                                                                                     | E2E y auditoría de accesibilidad automatizada                                                                                                           |
| Datos de prueba                    | Faker (`@faker-js/faker`)                                                                                                 | Seed de `apps/api` y fixtures de test con valores realistas, no placeholders repetidos                                                                  |
| Imágenes/CDN                       | Cloudinary (tier gratuito)                                                                                                | Alojamiento y optimización de las imágenes de producto del seed; consumido vía `next/image` + `remotePatterns` (`next-cloudinary` u loader equivalente) |
| Estilos                            | TailwindCSS v4 (CSS-first, `@theme`/`@source`, sin `tailwind.config.js`)                                                  | Utility-first sin pipeline de tokens propio; ver `ARCHITECTURE.md` §2.1                                                                                 |
| Variantes y clases                 | `cva` (class-variance-authority) + `tailwind-merge`                                                                       | Variantes de componente tipadas (`cva`), fusión segura de clases personalizables desde consumidores (`twMerge`); ver `AGENTS.md` §5                     |
| Calidad                            | ESLint (flat config), Prettier, Husky, lint-staged, commitlint                                                            | Calidad de código y commits consistentes                                                                                                                |
| Versionado de paquetes             | Changesets                                                                                                                | Versionado semántico de paquetes internos del monorepo                                                                                                  |
| Documentación                      | Storybook 10 (+ addon-a11y; interacciones vía `storybook/test`, integrado en el core desde Storybook 8, sin addon aparte) | Documentación viva del design system — también es el registro visual del proyecto, ya que no hay diseños previos en Figma                               |
| CI/CD                              | GitHub Actions                                                                                                            | Pipelines de lint, test, build, y Lighthouse CI                                                                                                         |

---

## 3. Principios Arquitectónicos

### 3.1 Type Safety First

Todo dato externo (respuestas de API, `env vars`, formularios, query params) se valida mediante esquemas Zod en el borde del sistema. Los tipos de TypeScript se infieren de esos esquemas (`z.infer`), nunca se duplican a mano.

### 3.2 Domain Driven Frontend

Las aplicaciones se organizan por dominios de negocio (`features/products`, `features/cart`, `features/orders`...), no por tipo técnico. Atomic Design **no** se usa para organizar lógica de negocio — solo para el design system.

### 3.3 Design System Independiente

El Design System (`packages/ui`) es un paquete aislado, exclusivamente visual y agnóstico de negocio. No importa nada de `features/*` ni conoce TanStack Query, Zustand o Zod.

### 3.4 Server Components por defecto

En Next.js App Router, todo componente es Server Component salvo que necesite interactividad, hooks de estado/efecto o APIs del navegador — en cuyo caso se marca `"use client"` explícitamente y se aísla lo más abajo posible en el árbol.

### 3.5 Server State vs. Client State vs. Contexto

Tres herramientas, tres responsabilidades sin solape:

- **TanStack Query**: estado que vive en el servidor (productos, carrito persistido, pedidos).
- **Zustand**: estado de UI/cliente mutable con lógica de actualización (modales, toggles, filtros no persistidos, wizard de checkout).
- **Context API (React)**: valores semi-estáticos de configuración/inyección de dependencias compartidos en un subárbol, que cambian poco y no necesitan store con lógica (tema, sesión de Auth.js, futura configuración de i18n). Si un "contexto" empieza a acumular lógica de actualización compleja, es una señal de que en realidad pertenece a Zustand.

Nunca se duplica un mismo dato entre dos de estas tres herramientas.

### 3.6 Component-first, sin diseño previo

No existe un diseño predefinido en Figma. El design system (`packages/ui`) se construye de forma iterativa **a la par** que se necesita, y Storybook actúa como registro visual del proyecto. Regla de flujo: antes de implementar cualquier página o template (home, detalle de producto, checkout...), primero se identifican y se crean o reutilizan los átomos/moléculas/organismos necesarios en `packages/ui`. Nunca se escribe UI ad-hoc dentro de una página que debería vivir en el design system.

### 3.7 Contratos compartidos

Los esquemas Zod que describen entidades de dominio (Product, Cart, Order, User) viven en `packages/shared-types` y son la única fuente de verdad, consumidos tanto por el backend fake (`apps/api`) como por `packages/api-client` y las features de cada app.

---

## 4. Estructura del Monorepo

```text
apps/
├── storefront      # Next.js — tienda pública
├── admin           # Next.js — panel de administración
├── api             # Next.js (solo Route Handlers) — backend fake
├── storybook       # Documentación del design system
└── playground      # Sandbox de exploración/prototipado

packages/
├── ui                # Design system (atoms/molecules/organisms)
├── design-tokens      # Tokens personalizados mínimos, sin pipeline de transformación
├── tailwind-config     # Preset de Tailwind compartido, consume design-tokens
├── auth              # Sesión, autorización, guards, roles
├── api-client         # Cliente tipado sobre fetch, valida respuestas con Zod
├── shared-types       # Esquemas Zod + tipos de dominio compartidos
├── core               # Utilidades y hooks agnósticos de dominio
├── testing            # Utilidades de test compartidas (render con providers, factories, server MSW)
├── eslint-config       # Configuración ESLint compartida
└── tsconfig            # tsconfig base compartido
```

Detalle de decisiones de cada paquete/app en [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 5. Design System

Atomic Design se utiliza **exclusivamente** dentro de `packages/ui`:

```text
packages/ui/
├── atoms
├── molecules
└── organisms
```

Cada componente se documenta en Storybook junto a su propia carpeta, co-localizando `Component.tsx`, `Component.stories.tsx` y `Component.test.tsx`.

No hay mockups de Figma que dirijan el inventario de componentes: se diseña y construye a la vez, página a página (ver principio 3.6). Esto implica que `packages/ui` nunca se da por "terminado" de antemano; crece bajo demanda conforme cada página lo requiere, pero **siempre por debajo** de la página que lo necesita (primero el componente en `packages/ui`, después su uso en la página).

**Precisión de alcance**: al no ser una tienda real, el objetivo no es un catálogo exhaustivo (no se persiguen 20-30 componentes ni cobertura de todos los casos posibles de un e-commerce real). Basta con un conjunto pequeño de átomos/moléculas realmente transversales más un puñado de organismos complejos como caso de estudio (p. ej. el wizard de checkout, una tarjeta de producto compuesta), suficientes para pintar el storefront/admin de la demo con calidad. El inventario crece con el contenido real que se vaya generando, nunca se diseña por adelantado ni se completa "por si acaso".

---

## 6. Organización de Aplicaciones

```text
src/
├── app/            # Rutas (Next.js App Router)
├── features/        # Dominios de negocio
├── providers/       # Providers globales (Query Client, Theme, Auth)
├── lib/             # Configuración de librerías (no lógica de negocio)
└── components/       # Componentes compartidos de la app (no del design system)
```

Ejemplo de feature:

```text
features/products/
├── api/          # Funciones que llaman a packages/api-client
├── hooks/        # useProducts, useProduct, etc. (TanStack Query)
├── services/     # Lógica de negocio pura, sin dependencias de React
├── schemas/      # Zod schemas específicos del dominio (si no viven en shared-types)
├── types/        # Tipos derivados no cubiertos por shared-types
├── utils/        # Helpers puros del dominio
└── components/    # Componentes específicos de la feature (usan packages/ui como bloques)
```

---

## 7. Gestión de Hooks

- Hooks de componente → junto al componente que los usa.
- Hooks de dominio → dentro de `features/<dominio>/hooks`.
- Hooks compartidos entre dominios/apps → `packages/core/hooks`.

---

## 8. Autenticación

`packages/auth` encapsula:

- Sesión (Auth.js v5, JWT strategy)
- Autorización basada en roles (`customer`, `admin`)
- Guards (middleware de Next.js + HOCs/hooks `useRequireAuth`)
- Integración con `apps/api` como Credentials Provider

Detalle de flujo en `ARCHITECTURE.md` §4.

---

## 9. Backend fake y datos

`apps/api` es una app Next.js dedicada exclusivamente a Route Handlers (sin UI), respaldada por Prisma + SQLite, con migraciones y seed de datos. Se elige un backend real-pero-ligero (no `json-server`, no solo mocks) para poder demostrar diseño de API, migraciones y contratos tipados de punta a punta. Detalle completo en `ARCHITECTURE.md` §3.

MSW se reserva para **tests** (unit/integración), interceptando llamadas HTTP sin depender de `apps/api` estar corriendo.

---

## 10. Testing

| Nivel         | Herramienta                                                               | Qué cubre                                                               |
| ------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Unit          | Vitest + Testing Library                                                  | Componentes de `packages/ui`, hooks, servicios puros                    |
| Integración   | Vitest + Testing Library + MSW                                            | Features completas (hook + componente + llamada API mockeada)           |
| E2E           | Playwright                                                                | Flujos críticos de usuario (catálogo → carrito → checkout, login admin) |
| Accesibilidad | `@axe-core/playwright`, `eslint-plugin-jsx-a11y`, addon-a11y de Storybook | Verificación automatizada WCAG 2.1 AA                                   |
| Performance   | Lighthouse CI (GitHub Actions)                                            | Presupuestos de Core Web Vitals                                         |

---

## 11. Calidad de código y convenciones

Ver [`AGENTS.md`](../AGENTS.md) para el detalle operativo (naming, estructura de commits, límites de estado, etc.). Ese documento es multi-herramienta (Claude Code, Codex, Cursor...); [`CLAUDE.md`](../CLAUDE.md) añade el contexto y las herramientas específicas de Claude Code (subagentes y skills planificados) para trabajar en este repo.

---

## 12. Roadmap

Ver [`ROADMAP.md`](./ROADMAP.md) para el desglose completo por fases, tareas y criterios de aceptación.

---

## 13. Historial de versiones

| Versión | Fecha      | Cambios                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1    | 2026-06-09 | Borrador inicial                                                                                                                                                                                                                                                                                                                                                                                                                    |
| v1.0    | 2026-07-04 | Definición de backend fake (Next Route Handlers + Prisma + SQLite), separación en `ARCHITECTURE.md`/`ROADMAP.md`/`AGENTS.md`/`CLAUDE.md`, adición de `packages/tailwind-config`, `apps/api`, principios de Server Components y límites Server/Client state, no-objetivos explícitos                                                                                                                                                 |
| v1.1    | 2026-07-04 | Context API incorporada a la gestión de estado (config/DI de subárbol); se retira Style Dictionary del stack (personalización de Tailwind sin pipeline de tokens multiplataforma); se explicita que no hay diseño previo en Figma y se añade el principio component-first (design system se construye página a página, siempre por debajo de la página que lo necesita)                                                             |
| v1.2    | 2026-07-06 | `AGENTS.md` ampliado con principios de código adicionales (Readability First, KISS, DRY, YAGNI), una sección de convenciones TypeScript/JavaScript, y matices de testing (selectores accesibles, patrón AAA, cobertura ~80%, Faker para fixtures); Faker incorporado explícitamente al stack tecnológico (§2); candidatos de testing avanzado (regresión visual, tests como documentación viva) añadidos al backlog de `ROADMAP.md` |
| v1.3    | 2026-07-06 | `AGENTS.md` ampliado con convenciones de Performance (imágenes/CDN, navegación, streaming, memoización, listas virtualizadas...) y una nueva sección de Seguridad (env vars, defensa en profundidad, datos sensibles al cliente); Cloudinary incorporado al stack como CDN de imágenes de producto (§2)                                                                                                                             |
| v1.4    | 2026-07-06 | `AGENTS.md` ampliado con convenciones de Estilos (`cva`/`cx`/`twMerge`, prohibición de `@apply`, riesgo de clases Tailwind dinámicas) y contenido de referentes (Kent C. Dodds: AHA programming/testing, Testing Trophy; Matt Pocock: enums; clean-code-javascript-es: Single Responsibility, parámetros de función)                                                                                                                |
| v1.5    | 2026-07-06 | Repositorio remoto creado en `github.com/afranco83/store-demo`; `AGENTS.md` se da por completo por ahora (Fase 0); corregidas referencias cruzadas desactualizadas en `CLAUDE.md` tras las renumeraciones de secciones de `AGENTS.md`; `cva`/`tailwind-merge` incorporados al stack (§2)                                                                                                                                            |
| v1.6    | 2026-07-07 | Fase 0 cerrada con aprobación explícita del usuario; añadida precisión de alcance en Design System (§5): no se persigue un catálogo exhaustivo, basta un conjunto pequeño de átomos/moléculas transversales más algunos organismos complejos como caso de estudio                                                                                                                                                                   |
| v1.7    | 2026-07-08 | Fase 3 cerrada: TailwindCSS v4 (CSS-first) adoptado en vez del estilo v3 asumido en versiones previas de este documento, incorporado explícitamente al stack (§2); Storybook 10 documentado sin `addon-interactions` como paquete aparte (interacciones vía `storybook/test`, integradas en el core desde Storybook 8)                                                                                                              |
