# ROADMAP.md

Desglose por fases con tareas y criterios de aceptación (Definition of Done). Cada fase depende de que la anterior cumpla su DoD. Las fases sustituyen a la numeración de `PROJECT_SPECIFICATION_v0.1.md`: se inserta backend antes del storefront y se separa "calidad transversal" al final como fase propia.

Estado actual: **Fase 4 cerrada en local (2026-07-08)**, en rama `feat/phase-4-storefront`, pendiente de PR; Fase 3 cerrada y mergeada en `main` (PR #3); Fase 2 mergeada (PR #2) y Fase 1 mergeada (PR #1); Fase 0 cerrada el 2026-07-07, con aprobación explícita del usuario de v1.0 de toda la documentación.

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

## Fase 3 — Design System (Base) _(cerrada — 2026-07-08)_

**Objetivo**: cimientos del sistema visual — no un catálogo completo (no hay diseño previo en Figma; `packages/ui` crece página a página, ver `AGENTS.md` principio 6). Esta fase entrega solo lo transversal que sabemos que toda página va a necesitar.

Tareas:

- [x] `packages/design-tokens`: valores personalizados mínimos y justificados (acento de marca `#c2410c` + tipografía display "Space Grotesk"), como constantes TS simples — sin pipeline de transformación. `design-tokens` también expone `tokens.css` (custom properties + bloque `@theme`) para Tailwind v4
- [x] `packages/tailwind-config`: preset **Tailwind v4 CSS-first** (`preset.css`: `@import "tailwindcss"` + tokens de `design-tokens`) — decisión tomada junto al usuario, sustituye el estilo v3 (`theme.extend`/`content`) asumido en versiones previas de `ARCHITECTURE.md`/`PROJECT_SPECIFICATION.md`, ya actualizadas
- [x] `packages/ui`: átomos verdaderamente transversales (Button, Input, Badge, Spinner, Icon, Typography), iconos vía `lucide-react`
- [x] `apps/storybook`: configurado con Storybook 10 (builder `@storybook/react-vite`, ya que `packages/ui` no depende de Next.js) + addon-a11y. **Sin** `addon-interactions` como paquete aparte: desde Storybook 8 esa funcionalidad vive en el core (`storybook/test`), y el paquete standalone quedó congelado en `8.6.x` frente a un core en `10.x` — se documenta esta sustitución en `PROJECT_SPECIFICATION.md` §2
- [x] Historias de Storybook + test unitario + a11y (`vitest-axe`) para cada átomo de esta fase
- [x] `packages/testing`: `renderWithProviders` base reutilizable desde ya (wrapper de `render` + `userEvent.setup()`, sin providers globales todavía — punto de extensión listo para Fase 4+), más el setup compartido de Vitest (`jest-dom`, `vitest-axe`, cleanup de RTL)

**DoD**: `apps/storybook` corre localmente con los átomos base documentados (`pnpm --filter @store-demo/storybook dev`, verificado; `storybook build` también en verde), 0 violaciones a11y "serias"/"críticas" (cubierto por test unitario `vitest-axe` en cada átomo, ya que no hay herramienta de navegador disponible en este entorno para verificar el addon-a11y de forma interactiva). Cobertura de test en `packages/ui`: **100%** líneas/funciones/statements, **100%** ramas — por encima del ≥85% exigido. `pnpm turbo lint typecheck test build` en verde en los 16 paquetes/apps del monorepo. **Cumplido.**

**Adenda (2026-07-08, revisión post-cierre del usuario)**: al repasar el acento en dark mode se detectó que `#c2410c` no llega a AA sobre fondos oscuros (~3.4-3.8:1, por debajo de 4.5:1). Se añadieron variantes dark de `--color-accent`/`-hover`/`-foreground`/`-soft` en `tokens.css` bajo `@media (prefers-color-scheme: dark)` — verificadas a mano con la fórmula de contraste WCAG (no hay test automático de contraste en este entorno, ver nota de DoD arriba). `Badge` pasó de `bg-accent/10` a un token `--color-accent-soft` propio porque la opacidad AA-correcta difiere entre claro (10%) y oscuro (18%). Alcance deliberadamente acotado al acento: el resto de la paleta (grises, colores semánticos) sigue solo-claro, y no existe todavía un toggle manual de tema — candidato de una fase futura si se decide construir uno. Detalle técnico en `ARCHITECTURE.md` §2.1.

---

## Fase 4 — Storefront: Catálogo & Carrito _(cerrada en local — 2026-07-08)_

**Objetivo**: primera app de negocio funcional end-to-end (lectura + carrito).

Tareas:

- [x] Component-first: identificar y crear en `packages/ui` las moléculas/organismos que falten para catálogo y carrito (ProductCard, PriceTag, QuantitySelector, Navbar, CartDrawer...) antes de montar cualquier página — más `EmptyState`, `ProductGrid` y `CartLineItem`, gaps detectados durante la implementación (DRY/AHA, `AGENTS.md §1.9`)
- [x] `features/products`: api/hooks/services/schemas/components (listado, detalle, filtros) — sin `hooks/` (YAGNI: listado/detalle se sirven vía Server Components llamando a `api-client` directamente, sin TanStack Query para datos de solo lectura)
- [x] `features/cart`: estado de carrito (Zustand para UI del drawer, TanStack Query + `apps/api` para persistencia)
- [x] Páginas App Router: `/`, `/products`, `/products/[slug]`, integrando Server Components por defecto
- [x] Providers globales (`providers/QueryProvider`, etc.)
- [x] Tests de integración de ambas features con `packages/testing`
- [x] Primeros specs E2E (Playwright): navegar catálogo → añadir al carrito

**DoD**: flujo de catálogo→carrito funciona contra `apps/api` real, specs E2E en verde, sin `"use client"` en componentes que no lo necesitan (verificable por revisión). **Cumplido**: `pnpm turbo lint typecheck test build` en verde en los 16 paquetes/apps, 5 specs E2E (Playwright, Chromium real) en verde contra `apps/api` real, flujo catálogo→filtro por categoría→detalle→añadir al carrito→drawer verificado manualmente y por E2E. `"use client"` solo en `CartAwareNavbar`, `AddToCartButton`, `ProductCardLink`, `CartDrawerContainer`, `QueryProvider` y `CartDrawer` (design system, necesita `useEffect` para el focus trap y cerrar con Escape) — el resto del árbol (páginas, `SiteHeader`, `ProductGridSection`, `CategoryFilterNav`) son Server Components.

**Decisiones tomadas con el usuario antes de implementar** (plan mode): mutaciones del carrito como Server Actions (`features/cart/api/*.action.ts`), extendido a la lectura (`useCart`) por testabilidad con Vitest+MSW sin necesitar mocks de red adicionales; identidad del carrito sin auth real vía un usuario demo fijo (seedeado, resuelto en runtime con `login()` y memoizado — sustituible en Fase 5 por sesión real); filtros de catálogo limitados a categoría (única dimensión que soporta `apps/api`).

**Notas técnicas no obvias de la Fase 4:**

- `packages/testing`'s `renderWithProviders` ahora envuelve `QueryClientProvider` (el "punto de extensión" que dejó preparado la Fase 3); nuevo `packages/testing/src/query-client.tsx` con `createTestQueryClient`/`createQueryWrapper`.
- El paquete `server-only` lanza en tiempo de ejecución si detecta globals de navegador (`window`/`document`) — bajo jsdom estos SIEMPRE existen, así que cualquier módulo con `import "server-only"` revienta en tests de Vitest. Se retiró de `features/cart/lib/get-demo-user-id.ts` (las Server Actions que lo importan ya tienen su propio límite de compilación vía `"use server"`); se mantiene en `features/products/api/*.ts` porque esos módulos no están cubiertos por ningún test bajo jsdom.
- El `tsconfig.json` de `apps/storefront` hereda `jsx: "preserve"` de `@store-demo/tsconfig/nextjs.json` (lo exige el compilador de Next). Fuera del pipeline de Next, Vitest necesita transformar el JSX él mismo — hizo falta añadir `@vitejs/plugin-react` a `vitest.config.ts` (ajustar solo `esbuild.jsx`/`tsconfigRaw` no fue suficiente, el parser SSR de Vite 8 no los respeta en este caso).
- El umbral de cobertura de `apps/storefront` (80%, `AGENTS.md §6`) se acota a `features/**/{hooks,services,store,lib,schemas}` — los componentes de composición Server/Client (páginas, `ProductCardLink`, `SiteHeader`...) se validan por integración/E2E, no por cobertura unitaria exhaustiva, mismo criterio que ya aplicaba `docs/ARCHITECTURE.md §6` al Testing Trophy.
- `CartDrawer` (organism) necesitó `"use client"` explícito pese a que `packages/ui` evita depender de Next.js: al reexportarse desde el barrel `packages/ui/src/index.ts`, Next evalúa el módulo aunque una página Server Component solo use otro componente del mismo barrel — cualquier componente que use hooks exclusivos de cliente (`useEffect`, `useState`...) necesita el directive así, sin excepción, si vive en un paquete consumido vía barrel.
- `<dialog>` nativo (`showModal()`/`close()`) no está implementado en `jsdom@29`; `CartDrawer` se implementó como overlay simple (`role="dialog"`, cierre por Escape/backdrop/botón vía `useEffect`) en vez de depender del elemento nativo, manteniendo cero dependencias nuevas.
- `CartItem.userId` es FK real a `User` en Prisma (no admite un id arbitrario) — de ahí la necesidad de resolver el usuario demo vía `login()` real contra el seed, en vez de un id hardcodeado o inventado.

**Adenda a Fase 4 — quick-add y revisión de código (2026-07-08, misma sesión de PR review):**

Durante la revisión de la PR, el usuario pidió añadir un botón de "añadir al carrito" directamente en `ProductCard` (antes solo existía en el detalle de producto). `ProductCard` gana `onAddToCart?`/`addToCartLabel?` (botón con icono, opcional, sin selector de cantidad — siempre 1 unidad). `ProductCardLink` pasó de Server Component a Client Component y sustituyó el `<Link>` envolvente por el patrón **stretched link** (overlay `absolute inset-0` + botón con `z-index` propio) para no anidar un `<button>` dentro de un `<a>` (HTML inválido); hizo falta un `z-index` explícito porque `ProductCard` ya tenía un contenedor `position: relative` propio (para el badge de stock) que competía con el overlay al mismo nivel de stacking y ganaba por estar más profundo en el árbol.

Después, un `/code-review high` sobre el diff completo de la PR encontró y se corrigieron 8 problemas reales (commit `554bbd7`), de mayor a menor severidad:

- **`getDemoUserId` cacheaba una promesa rechazada para siempre** si `login()` fallaba una vez (`cachedUserId ??= ...` nunca reasigna sobre un rechazo, solo sobre `null`/`undefined`) — rompía el carrito entero hasta reiniciar el servidor. Encontrado de forma independiente por 4 de los 8 agentes de búsqueda del review.
- **Añadir un producto ya presente en el carrito sobrescribía su cantidad** en vez de sumarla — `apps/api` hace `upsert` con la cantidad absoluta recibida, no un incremento. `useAddToCartMutation` ahora lee la cantidad existente de la caché de TanStack Query y manda el total.
- **Condición de carrera en `CartDrawerContainer`**: una única instancia de `useUpdateCartItemMutation`/`useRemoveCartItemMutation` compartida por todas las líneas del carrito hacía que `isUpdating` solo reflejara el último ítem pulsado. Se rastrea ahora un `Set` de `productId`s pendientes, actualizado con `mutateAsync` (no `mutate` con callbacks — TanStack Query desengancha el observer de una mutación en curso en cuanto se llama a `mutate()`/`mutateAsync()` de nuevo sobre la misma instancia, ver `AGENTS.md §1.5`).
- **`CartDrawer` sin focus trap ni restauración de foco** al cerrar — gap de accesibilidad real que el test de `vitest-axe` (análisis estático del DOM) no detecta, al ser comportamiento dinámico de foco.
- **Sin `error.tsx`** en `apps/storefront/src/app` — un fallo de `apps/api` al cargar la home reventaba en la página de error genérica de Next en vez de degradar con gracia.
- **Labels en inglés colándose en la tienda en español**: el botón de añadir rápido y los +/- de cantidad dentro del drawer caían en los defaults en inglés de `packages/ui` por no pasarse `addToCartLabel`/`decreaseQuantityLabel`/`increaseQuantityLabel` desde la app.
- **`SiteHeader` entero marcado `"use client"`** cuando solo el botón del carrito necesita hooks — dividido en `SiteHeader` (Server Component, logo/nav estáticos) + `CartAwareNavbar` (Client Component, solo el botón), pasando el contenido estático como children/props desde el Server Component.
- **`invalidateQueries` redundante**: las tres mutaciones del carrito forzaban un GET adicional a `apps/api` aunque su propia respuesta ya traía los datos frescos — sustituido por `setQueryData` con la respuesta de la mutación.

Ajuste posterior, pedido explícitamente por el usuario tras revisar visualmente: la imagen de `CartLineItem` pasó de `size-16 object-cover` (cuadrado fijo, recorta) a `h-16 w-auto object-contain` (altura fija, ancho según la proporción real de la imagen, sin recortar).

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
