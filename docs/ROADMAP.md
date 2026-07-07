# ROADMAP.md

Desglose por fases con tareas y criterios de aceptación (Definition of Done). Cada fase depende de que la anterior cumpla su DoD. Las fases sustituyen a la numeración de `PROJECT_SPECIFICATION_v0.1.md`: se inserta backend antes del storefront y se separa "calidad transversal" al final como fase propia.

Estado actual: **Fase 2 cerrada (2026-07-07)** — Fase 1 mergeada en `main` (PR #1); Fase 0 cerrada el 2026-07-07, con aprobación explícita del usuario de v1.0 de toda la documentación.

---

## Fase 0 — Fundamentos y Documentación _(cerrada — 2026-07-07)_

**Objetivo**: dejar asentadas las bases de decisión antes de escribir código.

Tareas:

- [x] Especificación general (`PROJECT_SPECIFICATION.md`)
- [x] Arquitectura técnica detallada (`ARCHITECTURE.md`)
- [x] Roadmap desglosado (este documento)
- [x] `AGENTS.md` con convenciones de código _(dado por completo para v1.0; se seguirá matizando en sesiones futuras, pero no bloquea el resto de la Fase 0)_
- [x] `CLAUDE.md` con contexto y agentes/skills planificados
- [x] Revisión y aprobación explícita del usuario de v1.0 de toda la documentación _(2026-07-07: "creo que ya tenemos buena base y siempre podemos ir mejorando" — se cierra la fase con mejora continua activa, no con un cierre rígido; ver `CLAUDE.md` "Cómo trabajar en este repo")_

**DoD**: los 4 documentos existen, están enlazados entre sí, y el usuario confirma que son la base aceptable para empezar a implementar. **Cumplido.**

---

## Fase 1 — Monorepo & Tooling Base

**Objetivo**: esqueleto del monorepo funcionando, sin lógica de negocio.

Tareas:

- [x] Inicializar repo git + `pnpm-workspace.yaml`
- [x] Configurar Turborepo (`turbo.json`) con pipelines `build`/`dev`/`lint`/`test`/`typecheck`
- [x] Crear `packages/tsconfig` (base, nextjs, react-library)
- [x] Crear `packages/eslint-config` (flat config, presets base/react/next) — pinado a ESLint 9.x: `eslint-plugin-react`/`eslint-plugin-jsx-a11y` aún no soportan ESLint 10 como peer, se sube de versión cuando lo hagan
- [x] Configurar Prettier + integración con ESLint (`eslint-config-prettier`)
- [x] Configurar Husky + lint-staged + commitlint (Conventional Commits) — `lint-staged` solo formatea (Prettier); el lint real de ESLint queda en `turbo lint`/CI para evitar problemas de resolución de flat config por paquete al ejecutar desde la raíz
- [x] Crear las 5 apps y 10 packages vacíos con su `package.json` y tsconfig correcto, sin contenido de negocio — `apps/storybook` es un placeholder sin dependencia de Storybook todavía (se configura en Fase 3); los paquetes internos no tienen paso de `build` propio, se consumen como fuente TS directa (se añadirá `transpilePackages` en el `next.config` de cada app cuando una feature real los importe)
- [x] CI base (`ci.yml`): install + lint + typecheck en cada PR

**DoD**: `pnpm install && pnpm turbo lint typecheck` pasa en verde desde cero (27/27 tareas, verificado localmente tras limpiar `node_modules`/caché de Turborepo). Ningún paquete tiene código de negocio todavía. **Cumplido y mergeado en `main` (PR #1).**

---

## Fase 2 — Backend Fake & Contratos _(cerrada — 2026-07-07)_

**Objetivo**: tener datos reales que consumir antes de construir UI de negocio.

Tareas:

- [x] Definir esquema Prisma (`Product`, `Category`, `User`, `Order`, `OrderItem`, `CartItem`) — `CartItem` como tabla propia, no `Order` en estado `draft` (decisión cerrada en esta fase); dinero en céntimos (`Int`), `role`/`status` como `String` (SQLite no soporta enums nativos de Prisma), unión de literales validada solo en Zod
- [x] Migraciones + script de seed (`@faker-js/faker`, seed fijo) — catálogo enfocado en apparel/streetwear: 3 categorías (Camisetas, Gorras, Zapatillas), 15 productos, 3 usuarios demo, cart items y un pedido de ejemplo
- [x] Cuenta Cloudinary (tier gratuito) + imágenes de producto subidas para el seed (fotos reales buscadas en la API de Unsplash por categoría — `picsum.photos`/`loremflickr.com` se descartaron por dar contenido irrelevante o inapropiado, ver nota abajo — re-subidas a Cloudinary vía unsigned upload preset); `next.config.ts` de `storefront`/`admin` con `images.remotePatterns` apuntando a su dominio
- [x] `packages/shared-types`: esquemas Zod de las entidades de dominio + tipos inferidos
- [x] `apps/api`: Route Handlers CRUD de productos, categorías, carrito, pedidos, y endpoint de login — sin sesión/JWT real todavía (`userId` explícito en la ruta; el guard de autorización es Fase 5)
- [x] Validación de entrada/salida con Zod en cada handler (`validateOutputInDev` revalida en desarrollo para detectar drift Prisma↔Zod)
- [x] `packages/api-client`: funciones tipadas por dominio, parseo de respuesta con Zod
- [x] `packages/testing`: setup de servidor MSW + factories basadas en los esquemas de `shared-types` (`renderWithProviders` queda para Fase 3, no se adelanta)
- [x] Tests unitarios de `api-client` contra MSW

**DoD**: `apps/api` corre localmente, responde datos seedeados, y `api-client` obtiene datos tipados sin `any` en ningún punto. Cobertura de test en `api-client` ≥ 80%. **Cumplido**: cobertura real 100% líneas/funciones, 95.23% ramas; `pnpm turbo lint typecheck test build` en verde en los 15 paquetes/apps del monorepo.

**Nota sobre la fuente de imágenes del seed**: se probaron dos servicios de placeholder por keyword antes de asentarse en Unsplash — `loremflickr.com` (búsqueda libre de tags en Flickr) devolvió fotos sin relación con la keyword e incluso una imagen inapropiada para un repo de portfolio; se descartó de inmediato. La API de búsqueda de Unsplash (moderada, requiere Access Key gratuita de `unsplash.com/developers`) sí da resultados fiables y relevantes por categoría. `picsum.photos` (usado en la primera versión del seed) es seguro pero da fotos totalmente aleatorias sin relación con el producto — válido solo mientras el catálogo era genérico, no una vez se enfocó en apparel real (camisetas/gorras/zapatillas).

---

## Fase 3 — Design System (Base)

**Objetivo**: cimientos del sistema visual — no un catálogo completo (no hay diseño previo en Figma; `packages/ui` crece página a página, ver `AGENTS.md` principio 6). Esta fase entrega solo lo transversal que sabemos que toda página va a necesitar.

Tareas:

- [ ] `packages/design-tokens`: valores personalizados mínimos y justificados (color de marca/acento, tipografía si aplica), como constantes simples — sin pipeline de transformación
- [ ] `packages/tailwind-config`: preset que extiende el theme por defecto de Tailwind con esos tokens
- [ ] `packages/ui`: átomos verdaderamente transversales (Button, Input, Badge, Spinner, Icon, Typography)
- [ ] `apps/storybook`: configurado, con addon-a11y y addon-interactions
- [ ] Historias de Storybook + test unitario + a11y para cada átomo de esta fase
- [ ] `packages/testing`: `renderWithProviders` base reutilizable desde ya

**DoD**: `apps/storybook` corre localmente con los átomos base documentados, 0 violaciones a11y "serias"/"críticas", cobertura de test en `packages/ui` ≥ 85% de lo construido hasta ahora. **No** es requisito tener moléculas/organismos ni cobertura completa de un inventario hipotético: esos se crean bajo demanda en las fases siguientes, siguiendo el flujo component-first.

---

## Fase 4 — Storefront: Catálogo & Carrito

**Objetivo**: primera app de negocio funcional end-to-end (lectura + carrito).

Tareas:

- [ ] Component-first: identificar y crear en `packages/ui` las moléculas/organismos que falten para catálogo y carrito (ProductCard, PriceTag, QuantitySelector, Navbar, CartDrawer...) antes de montar cualquier página
- [ ] `features/products`: api/hooks/services/schemas/components (listado, detalle, filtros)
- [ ] `features/cart`: estado de carrito (Zustand para UI del drawer, TanStack Query + `apps/api` para persistencia)
- [ ] Páginas App Router: `/`, `/products`, `/products/[slug]`, integrando Server Components por defecto
- [ ] Providers globales (`providers/QueryProvider`, etc.)
- [ ] Tests de integración de ambas features con `packages/testing`
- [ ] Primeros specs E2E (Playwright): navegar catálogo → añadir al carrito

**DoD**: flujo de catálogo→carrito funciona contra `apps/api` real, specs E2E en verde, sin `"use client"` en componentes que no lo necesitan (verificable por revisión).

---

## Fase 5 — Autenticación & Cuenta

**Objetivo**: sesión de usuario y área privada.

Tareas:

- [ ] `packages/auth`: Auth.js v5, Credentials Provider contra `apps/api`, sesión expuesta vía Context (`SessionProvider`)
- [ ] Roles `customer`/`admin` en JWT
- [ ] Component-first: formularios de login/registro y componentes de listado de pedidos que falten en `packages/ui`
- [ ] `features/auth` (o dentro de `packages/auth` + páginas): login, registro, logout
- [ ] `features/orders`: historial de pedidos del usuario autenticado
- [ ] Guards: middleware en rutas privadas de `storefront`
- [ ] Tests unitarios de guards + E2E de login/logout

**DoD**: usuario puede registrarse/iniciar sesión, ver su historial de pedidos, y las rutas privadas redirigen correctamente si no hay sesión.

---

## Fase 6 — Checkout

**Objetivo**: cerrar el flujo transaccional principal del storefront.

Tareas:

- [ ] Component-first: pasos/steps del wizard, resumen de pedido y demás moléculas/organismos que falten en `packages/ui`
- [ ] `features/checkout`: formulario multi-paso con React Hook Form + Zod Resolver
- [ ] Wizard de checkout gestionado con Zustand (paso actual, validez por paso)
- [ ] Creación de pedido contra `apps/api` (sin pasarela de pago real — simulada)
- [ ] Confirmación de pedido + vínculo con `features/orders`
- [ ] Tests de integración del formulario (validación, envío, errores de servidor)
- [ ] Spec E2E completo: catálogo → carrito → checkout → confirmación

**DoD**: flujo de compra completo funcional y cubierto por E2E, sin errores de validación no controlados.

---

## Fase 7 — Admin

**Objetivo**: segunda app de negocio, reutilizando el design system y los contratos ya construidos.

Tareas:

- [ ] `apps/admin`: bootstrap reutilizando `packages/ui`, `auth`, `api-client`
- [ ] Component-first: componentes de tabla/formulario de administración que falten en `packages/ui` (probablemente el primer punto donde aparecen organismos nuevos propios de `admin`)
- [ ] `features/products` (admin): CRUD de productos y categorías
- [ ] `features/orders` (admin): listado y cambio de estado de pedidos
- [ ] Guard de rol `admin` a nivel de middleware
- [ ] Tests de integración de los CRUD + E2E de login admin → editar producto

**DoD**: un usuario con rol `admin` puede gestionar catálogo y pedidos; un usuario `customer` no puede acceder a `apps/admin`.

---

## Fase 8 — Calidad Transversal

**Objetivo**: cerrar las garantías de calidad que no se pueden validar app por app de forma aislada.

Tareas:

- [ ] Auditoría de accesibilidad completa (Playwright + axe) sobre todas las rutas de `storefront` y `admin`
- [ ] Lighthouse CI integrado en el pipeline, presupuestos de Core Web Vitals afinados con datos reales
- [ ] Revisión de cobertura de tests global (unit + integración + E2E) y cierre de huecos
- [ ] Documentación avanzada: README por paquete/app, diagramas de arquitectura, decision records (ADR) si aplica
- [ ] Revisión de bundle size (`@next/bundle-analyzer`) y code-splitting donde falte
- [ ] Decisión y, si procede, despliegue de demo pública (Vercel)

**DoD**: pipelines de CI en verde con los presupuestos definitivos, 0 violaciones a11y serias/críticas en toda la app, documentación de cada paquete/app existente y actualizada.

---

## Backlog / candidatos a fases futuras (fuera de v1)

- Internacionalización (i18n)
- Feature flags
- Analítica de producto
- Publicación real de paquetes a npm vía Changesets
- App interna de gestión de git worktrees (monitorización, creación, edición y borrado), para no depender de comandos manuales de `git worktree` durante el desarrollo en paralelo (ver `ARCHITECTURE.md` §8). No comprometida todavía: se evalúa cuando el multitasking manual empiece a doler de verdad.
- Testing de regresión visual automatizada (p. ej. Chromatic/Percy sobre las historias de Storybook de `packages/ui`). No comprometido: en principio la pirámide actual (unitario/integración + E2E de `AGENTS.md` §6) se considera suficiente para el alcance de este proyecto; se reevalúa solo si aparecen regresiones visuales reales que ese testing no atrape.
- "Tests como documentación viva" para stakeholders no técnicos (specs en Gherkin/Cucumber). No comprometido por la misma razón: añadiría una herramienta y un lenguaje de specs nuevos sin una necesidad concreta todavía; Storybook ya cumple parcialmente ese rol de documentación de `packages/ui`.
- Skills genéricas transversales reutilizables entre proyectos sobre este mismo stack (React + Next.js + TypeScript + Zod + TanStack Query + Zustand), separadas de las skills específicas de `store_demo`. No comprometido: hoy solo existe un proyecto sobre este stack, así que no hay forma de saber qué parte de las skills planificadas en `CLAUDE.md` es realmente transversal y cuál es específica de este repo sin haberlo comprobado en un segundo proyecto real; extraerlas ahora sería abstracción prematura (mismo criterio YAGNI de `AGENTS.md §10`). Se reevalúa si aparece un segundo proyecto sobre este stack.
- Workflows/automatizaciones adicionales a la CI ya prevista (`ci.yml`, `ARCHITECTURE.md`) — p. ej. hooks o rutinas programadas que disparen agentes/skills automáticamente ante ciertos eventos. No comprometido: no hay hoy un proceso manual concreto que esté doliendo lo bastante como para justificar la automatización; se reevalúa si surge uno.
