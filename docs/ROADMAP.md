# ROADMAP.md

Desglose por fases con tareas y criterios de aceptación (Definition of Done). Cada fase depende de que la anterior cumpla su DoD. Las fases sustituyen a la numeración de `PROJECT_SPECIFICATION_v0.1.md`: se inserta backend antes del storefront y se separa "calidad transversal" al final como fase propia.

Estado actual: **Fase 7 cerrada en local (2026-07-10)**, en rama `feat/phase-7-admin`, PR #8 abierta contra `main`; Fase 6 mergeada en `main` (PR #7); Fase 5 mergeada (PR #5); Fase 4 mergeada (PR #4); Fase 3 mergeada (PR #3); Fase 2 mergeada (PR #2) y Fase 1 mergeada (PR #1); Fase 0 cerrada el 2026-07-07, con aprobación explícita del usuario de v1.0 de toda la documentación.

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

**Adenda a Fase 4 — dos fallos de CI no reproducidos en local (2026-07-08):** tras el push, `.github/workflows/ci.yml` falló dos veces seguidas con errores que en local no habían aparecido nunca, por dos razones distintas de fondo (ver también `CLAUDE.md`, "Cómo trabajar en este repo"):

- **Caché de Turborepo obsoleta**: `packages/testing/src/query-client.tsx` (con JSX real) se exportaba desde el barrel principal de `@store-demo/testing`. Cualquier consumidor que importe de ahí obliga a TypeScript a resolver ese archivo — y `packages/api-client` no tiene `jsx` configurado en su tsconfig (no lo necesita para su propio código), así que su `typecheck` fallaba con `'--jsx' is not set`. En local pasaba siempre porque Turborepo tenía cacheado el resultado de `api-client#typecheck` de antes de que ese archivo existiera, y nada en el hash de esa tarea capturó el cambio. Arreglado sustituyendo el JSX por `createElement()` (renombrado a `.ts`), no tocando el tsconfig de ningún consumidor. **Lección**: antes de cada push, correr el gate una vez con `--force` (sin caché) — barato, y habría detectado esto al instante.
- **Build-time dependency de un servicio no levantado en CI**: la home (`/`) usaba el `revalidate: 60` por defecto de `getProducts()`, lo que hace que Next intente pre-renderizarla en build time. En local funcionaba porque `apps/api` siempre estaba levantado a mano; en CI no arranca ningún backend antes de `pnpm turbo build`, así que el fetch fallaba con `ECONNREFUSED`. Arreglado con `export const dynamic = "force-dynamic"` en la home, igualándola a `/products`/`/products/[slug]` (ya dinámicas por `searchParams`/`params`). **Lección**: cualquier página que dependa de un servicio externo en build time hay que probarla también sin ese servicio levantado, ya que CI nunca lo tiene salvo que se aprovisione explícitamente — esto no lo habría pillado ni `--force`, solo repetir el build con `apps/api` apagado.

Verificado tras ambos fixes con `pnpm turbo lint typecheck test build --force --concurrency=4`, sin `apps/api` corriendo — 35/35 en verde, y CI en verde en el siguiente push.

---

## Fase 5 — Autenticación & Cuenta _(cerrada en local — 2026-07-09)_

**Objetivo**: sesión de usuario y área privada.

Tareas:

- [x] `packages/auth`: Auth.js v5, Credentials Provider contra `apps/api` — **sin** sesión expuesta vía Context/`SessionProvider` (decisión tomada durante la implementación, ver adenda): `auth()` server-side + props a los Client Components que lo necesitan
- [x] Roles `customer`/`admin` en JWT
- [x] Component-first: `OrderSummaryCard` (molecule nuevo en `packages/ui`, con story + test) para el listado de pedidos; los formularios de login/registro reusan `Input`/`Button` ya existentes, sin átomo nuevo
- [x] `features/auth` (en `apps/storefront`, no en `packages/auth`): login, registro, logout — Server Actions + `LoginForm`/`RegisterForm` (React Hook Form + `zodResolver`, `AGENTS.md §4`)
- [x] `features/orders`: historial de pedidos del usuario autenticado
- [x] Guards: `middleware.ts` en rutas privadas de `storefront` (`/account/**`) vía `withAuthGuard()` reutilizable
- [x] Tests unitarios/integración de identidad de carrito y formularios + E2E de login/registro/logout/guard/fusión de carrito de invitado

**DoD**: usuario puede registrarse/iniciar sesión, ver su historial de pedidos, y las rutas privadas redirigen correctamente si no hay sesión. **Cumplido**: `pnpm turbo lint typecheck test build --force` en verde en los 18 paquetes/apps del monorepo, 10/10 specs E2E (Playwright, Chromium real) en verde contra `apps/api` real — incluye registro→cuenta, login→cuenta→logout, credenciales inválidas, ruta privada sin sesión→redirect con `callbackUrl`, y carrito de invitado→login→fusión.

**Decisiones tomadas con el usuario antes de implementar (plan mode)** — esta fase amplió su alcance más allá de lo previsto originalmente en el ROADMAP, a partir de dos preguntas resueltas con el usuario:

1. **Guard de `apps/api`**: en vez de mantener `[userId]` en la URL de `cart`/`orders` y solo cruzarlo contra el token, se rediseñaron los endpoints (`/api/cart`, `/api/orders`, sin segmento de usuario) para derivar la identidad siempre de un token verificado server-side — nunca de un id que el cliente pueda fijar. Cierra el "hueco de autorización aceptado" que quedó documentado en la Fase 2.
2. **Carrito de invitado con fusión al loguearse**: el usuario pidió que un usuario anónimo pueda comprar sin login (solo se exige sesión al pagar, alcance de Fase 6) y que su carrito se conserve al iniciar sesión. Como `CartItem.userId` era FK obligatoria a `User`, se optó por una migración de esquema (`userId` nullable + `guestId` nuevo, con sus propios `@@unique`/índice) en vez de reutilizar el hack de "usuario demo" de la Fase 4 con un id arbitrario.

**Notas técnicas no obvias de la Fase 5:**

- **Dos JWT distintos, sin compartir secreto**: Auth.js gestiona su propia cookie de sesión cifrada con `AUTH_SECRET` (independiente); el token que `apps/api` ya emitía en login (`signAuthToken`, `AUTH_JWT_SECRET`) se guarda aparte, en una cookie httpOnly propia (`api_token`, `packages/auth/src/cookies.ts`) fuera del JWT de Auth.js — así nunca pasa por el callback `session()` ni llega a `useSession()`/al cliente. `getApiToken()` (server-only) es el único punto de lectura para Server Actions.
- **Identidad de invitado sin criptografía, a propósito**: un carrito de invitado no tiene datos sensibles (ni PII ni pago), así que se identifica con un `crypto.randomUUID()` opaco en cookie httpOnly (`guest_cart_id`) y un header (`X-Guest-Id`) que `apps/api` no verifica — desproporcionado añadir firma/verificación para ese caso, mismo criterio de proporcionalidad que el resto del proyecto.
- **`middleware.ts` necesita una config de Auth.js "edge-safe" separada**: el Credentials Provider (`authorize()`, llama a `login()`) y el callback `signIn` (usa `cookies()` de `next/headers`) no son aptos para el Edge runtime de `middleware.ts`. `packages/auth` se dividió en `auth.config.ts` (sin providers, callbacks `jwt`/`session` puros, lo único que carga `middleware-guard.ts`) y `config.ts` (config completa, usada por la Route Handler `/api/auth/[...nextauth]`).
- **`next-auth@5.0.0-beta.31` no resuelve bien `"next/server"` bajo Vite/Vitest** (aunque sí bajo el bundler real de Next.js): el paquete tiene un `@ts-expect-error` reconociendo que Next.js "no usa bien `package.json#exports`" todavía. Como el barrel de `@store-demo/auth` reexporta `./config` (que invoca `NextAuth()` en el top-level), cualquier import desde el barrel rompía los tests de Vitest de `features/cart`/`features/orders`. Se añadió un `exports` map a `packages/auth/package.json` con subpaths dedicados (`./get-api-token`, `./middleware-guard`) que **no** pasan por `config.ts`, y el código de `apps/storefront` que sí se testea bajo Vitest los usa explícitamente en vez del barrel.
- **`next/headers` no funciona bajo Vitest sin un servidor Next real** (`cookies` was called outside a request scope): se añadió un mock compartido (`apps/storefront/src/test/next-headers-mock.ts`, registrado en `setupFiles`) con un almacén de cookies en memoria, reseteado entre tests — permite testear de verdad la resolución de identidad de carrito (sesión vs. invitado) en vez de tener que saltárselo.
- **Auth.js v5 exige `trustHost: true` explícito fuera de plataformas reconocidas** (Vercel, etc.): sin él, cualquier request de auth contra `localhost` (incluidos los specs E2E vía `next start`) falla con `UntrustedHost`. Se añadió a la config edge-safe compartida — encontrado y corregido gracias a que los specs E2E corren contra un servidor real, no solo contra mocks.
- **`JWT_EXPIRATION` de `apps/api` pasó de `"2h"` a `"30d"`**: al quedar embebido en la cookie `api_token` (que vive tanto como la sesión de Auth.js, 30 días por defecto), un token de corta duración habría dejado las Server Actions autenticadas fallando con 401 mucho antes de que la sesión "pareciera" caducada al usuario. _(Revisado después, ver adenda de code-review más abajo: bajó a 7 días con una cookie que se desliza en cada uso, en vez de un valor fijo largo sin ninguna forma de revocación.)_
- **`ROUTE PATCH /api/orders/[orderId]` distingue `customer` de `admin`**: aunque el guard de administración real es alcance de Fase 7, el rol ya viaja en el token verificado, así que el Route Handler ya acota por `userId` solo si el rol no es `admin` — evita tener que reabrir este archivo cuando llegue Fase 7.
- El aviso de compilación `The "middleware" file convention is deprecated. Please use "proxy" instead` (Next 16.2.10) es un cambio de convención muy reciente del framework, no bloqueante — se deja `middleware.ts` tal cual por ahora y se revisa si el proyecto llega a actualizar de major de Next.

**Adenda — iteraciones posteriores al cierre inicial (misma sesión, 2026-07-09):** tras el cierre y la PR #5, la fase siguió recibiendo trabajo en cuatro rondas antes de darse por definitivamente lista para review humana.

**1. Rediseño del área de sesión del navbar.** El enlace de texto "Iniciar sesión" pasa a ser "Login" con icono (`LogIn` de lucide), alineado a la derecha del carrito; con sesión activa se sustituye por un icono de usuario (`CircleUserRound`) que despliega un menú con "Mi cuenta", "Mis pedidos" y "Cerrar sesión". Nuevo organism `packages/ui/src/organisms/UserMenu` (component-first, con story y test) y `buttonVariants` de `Button` pasó a exportarse para poder aplicar el mismo tratamiento visual a un `<Link>` de Next (que no puede anidarse dentro de otro `<button>`). Bug real encontrado por el spec E2E de logout: cerrar el menú de forma síncrona al hacer click desmontaba el `<form>` de logout antes de que el navegador completara el envío nativo, cancelándolo — se difiere el cierre con `setTimeout(0)` (ver `ARCHITECTURE.md §4`).

**2. `/code-review high` sobre el diff completo de la PR: 10 hallazgos corregidos**, encontrados por 8 agentes de búsqueda en paralelo (3 ángulos de corrección, 3 de limpieza, altitud y convenciones) y verificados uno a uno antes de aplicarlos:

- `InvalidAuthTokenError` no se capturaba en ningún Route Handler de `cart`/`orders` (solo `UnauthorizedError`), así que un token expirado/manipulado devolvía 500 en vez de 401 — se captura ahora en el propio `apps/api/src/lib/guard.ts`, ningún Route Handler necesita saberlo.
- La cookie de invitado se borraba en el callback `signIn` aunque la fusión del carrito fallara, perdiendo esos `CartItem` para siempre — ahora solo se borra si la fusión tuvo éxito.
- `authorize()` capturaba cualquier error de `login()` (incluidos fallos de red de `apps/api`) como "credenciales inválidas" — ahora solo un 401 real lo es; el resto se distingue en `login.action.ts`/`register.action.ts` comprobando `CredentialsSignin` específicamente, no `AuthError` en general.
- `getOrdersAction` lanzaba un `Error` sin manejar si no había token — ahora hace `redirect("/login")`, igual que haría el guard de middleware.
- La fusión de carrito de invitado hacía un `findUnique` + `upsert` secuencial por item dentro de la transacción (2N round-trips reteniendo el lock de escritura de SQLite) — se cambió a una sola query + upserts en paralelo.
- `auth.config.ts` mutaba los parámetros `token`/`session` de los callbacks y usaba `as` sin comprobación de runtime, violando `AGENTS.md §2` literalmente — se sustituyó por copias (`spread`) y validación con Zod.
- El bloque `catch` de cart/orders (idéntico 6 veces) se extrajo a un único `handleCartRouteError` (luego renombrado, ver punto 4), y la cláusula `where` de la clave compuesta de `CartItem` a `cartItemUniqueWhere`.

**3. Bug real detectado en pruebas manuales del usuario** (no por tests): una cuenta sin pedidos que visitaba `/account/orders` reventaba con `"Cookies can only be modified in a Server Action or Route Handler"`. Causa: `getApiToken()` intenta deslizar el `maxAge` de la cookie `api_token` en cada lectura (fix del punto 2 de la ronda de code-review anterior), pero `getOrdersAction` se invoca desde `OrderHistorySection`, un Server Component durante el render de la página — no es una invocación real de Server Action ni un Route Handler, los únicos contextos donde `next/headers` permite escribir cookies, aunque el archivo tenga `"use server"`. Se envolvió el `cookieStore.set()` en un `try/catch` que falla en silencio en ese caso (el token ya se ha leído bien, solo se pierde deslizar su expiración en esa lectura de solo-render) y se añadió un spec E2E que reproduce exactamente el caso reportado.

**4. Nueva funcionalidad, fuera del alcance original de esta fase**: el usuario pidió poder editar nombre y email desde "Mi cuenta" (explícitamente sin contraseña, que quedaría como mejora separada con su propio flujo). Nuevo recurso `GET`/`PATCH /api/users/me` en `apps/api` (mismo criterio de identidad por Bearer token que `cart`/`orders`, nunca un id en la URL) y nuevo dominio `apps/storefront/src/features/account` (Server Actions `get-profile.action.ts`/`update-profile.action.ts` + `EditProfileForm`, mismo patrón RHF+`zodResolver` que `LoginForm`/`RegisterForm`). Decisión de diseño: `/account` deja de leer `session.user.name/email` (cacheado en el JWT desde el sign-in) y pide el perfil fresco a `apps/api` en cada visita, igual que ya hacía el historial de pedidos — evita la complejidad de refrescar el JWT de Auth.js tras editar. `handleCartRouteError` se renombró a `handleAuthenticatedRouteError` al dejar de ser exclusivo de `cart`/`orders`.

Verificado tras las cuatro rondas con `pnpm turbo lint typecheck test build --force` en verde y **11/11 specs E2E** (se sumaron 2 a los 10 originales: regresión de `/account/orders` sin pedidos, y edición de perfil con recarga para confirmar persistencia real). Los cuatro commits de esta adenda pasaron el CI de GitHub Actions en verde (un run intermedio se canceló por un problema puntual del runner, no del código; se relanzó y pasó en 1m54s).

---

## Fase 6 — Checkout _(cerrada en local — 2026-07-10)_

**Objetivo**: cerrar el flujo transaccional principal del storefront.

Tareas:

- [x] Component-first: `WizardSteps` (molecule nuevo en `packages/ui`, con story y test) para los pasos del checkout; resumen de pedido y línea de carrito reutilizan `OrderSummaryCard`/`PriceTag`/`Typography` ya existentes, sin organismo nuevo
- [x] `features/checkout`: formulario multi-paso con React Hook Form + Zod Resolver (`ShippingStepForm`, `PaymentStepForm`, `ReviewStep`)
- [x] Wizard de checkout gestionado con Zustand (`use-checkout-wizard-store`: paso actual, pasos completados, datos acumulados por paso, sin `persist`)
- [x] Creación de pedido contra `apps/api` (`POST /api/orders` extendido, sin pasarela de pago real — simulada con posibilidad de fallo controlado)
- [x] Confirmación de pedido + vínculo con `features/orders` (mismo `OrderSummaryCard` que el historial, enlace a `/account/orders`)
- [x] Tests de integración del formulario (validación, envío, errores de servidor — incluye el camino de pago rechazado)
- [x] Spec E2E completo: catálogo → carrito → checkout → confirmación, más un segundo spec del camino de fallo/recuperación con la tarjeta simulada

**DoD**: flujo de compra completo funcional y cubierto por E2E, sin errores de validación no controlados. **Cumplido**: `pnpm turbo lint typecheck test build --force` en verde en los 19 paquetes/apps del monorepo; 65/65 tests de `apps/storefront` (98.38% cobertura en `features/**/{store,components,lib}`) y 73/73 de `packages/ui`; 13/13 specs E2E (Playwright, Chromium real) en verde, incluidos los 2 nuevos de checkout (compra exitosa con verificación de que el navbar refleja el carrito vacío tras confirmar, y rechazo con la tarjeta mágica seguido de corrección sin perder los datos ya introducidos).

**Decisiones tomadas con el usuario antes de implementar (plan mode)**:

1. **Dirección de envío embebida en `Order`** (no un modelo `Address` propio) — no hay caso de uso de libreta de direcciones todavía.
2. **Wizard de 3 pasos**: Envío → Pago → Revisión/Confirmación (revisión y confirmación son el mismo paso, dos fases del mismo componente, no dos rutas).
3. **Envío simulado con tarifa plana + umbral de envío gratis** (`packages/shared-types/src/shipping.ts`, fuente única de verdad importada tanto por `apps/api` como por `apps/storefront`), sin impuestos aparte.
4. **Pago simulado con fallo controlado**: un "número de tarjeta mágico" (dígito final concreto, `payment.schema.ts`) fuerza un fallo simulado en el servidor — permite testear de verdad el camino de error (mensaje al usuario, reintento sin perder los datos ya introducidos de pasos anteriores) en vez de que el pago simulado tenga éxito siempre.

**Notas técnicas no obvias de la Fase 6:**

- **`POST /api/orders` se extendió, no se creó `/api/checkout`**: el checkout es un concepto de wizard de cliente, no un recurso nuevo de la API — un endpoint paralelo habría duplicado la transacción leer-carrito→calcular→crear→vaciar. El fallo de pago simulado se lanza **antes** de cualquier escritura dentro de la transacción de Prisma, así que ni crea el pedido ni vacía el carrito; los datos de tarjeta solo se leen para esa comprobación, nunca se persisten (ni siquiera el número completo — `Order.paymentSimulatedSuccess` es un booleano de snapshot).
- **Invalidación de caché de carrito tras confirmar**: `apps/api` vacía el carrito dentro de la misma transacción de `POST /api/orders`, pero la caché de TanStack Query del cliente no se entera sola — sin `queryClient.invalidateQueries({ queryKey: cartQueryKey })` en `ReviewStep` tras el éxito, el navbar/drawer seguirían mostrando los artículos ya comprados. Verificado explícitamente en el spec E2E de compra exitosa.
- **`features/orders/lib/format-order.ts` nuevo**: se extrajo de `OrderHistorySection` (`ORDER_STATUS_BADGES`, `formatOrderPlacedAtLabel`, `formatOrderItemCountLabel`) para reutilizarlo en la vista de confirmación del checkout — mismo criterio DRY de `AGENTS.md §1.9`, y mismo precedente ya existente de imports cruzados entre features (`features/products` → `features/cart`).
- **TypeScript no conserva el estrechamiento de tipo dentro de closures**: tras la guarda `if (!shippingAddress || !payment) return null` en `ReviewStep`, referenciar esas variables directamente dentro de la función anidada `handleConfirm` seguía dando `T | null` en el compilador — se reasignan a un objeto `CheckoutRequest` concreto en el punto donde sí están estrechadas, en vez de usar `!` (non-null assertion).
- **Migración de Prisma con datos de seed existentes**: como los 8 campos nuevos de `Order` son obligatorios y sin default, y ya había filas de seed, hubo que borrar `apps/api/dev.db` y regenerar desde cero (`prisma migrate dev` + `prisma generate` + `prisma db seed`) en vez de migrar los datos existentes — aceptable en una base SQLite de desarrollo, documentado como precedente para futuras migraciones que añadan columnas obligatorias.
- **`/checkout` protegido por `middleware.ts`** con el mismo `withAuthGuard` que `/account/**`: el checkout exige sesión siempre (decisión ya tomada en la Fase 5), así que se corta en el guard antes de que el usuario invitado llegue a ver el wizard.
- **Guard de carrito vacío en `CheckoutWizard`**: cubre tanto a quien llega a `/checkout` sin nada en el carrito como a quien recarga la página justo después de confirmar un pedido (el store del wizard no tiene `persist` — se resetea con el reload — y el carrito ya está vacío server-side en ese punto).

---

## Fase 7 — Admin _(cerrada en local — 2026-07-10)_

**Objetivo**: segunda app de negocio, reutilizando el design system y los contratos ya construidos.

Tareas:

- [x] `apps/admin`: bootstrap reutilizando `packages/ui`, `auth`, `api-client` — sin TanStack Query ni Zustand (decisión tomada durante la implementación, ver abajo)
- [x] Component-first: componentes de tabla/formulario de administración que faltaban en `packages/ui` — `Select` y `Textarea` (átomos), `Table` (molecule, compound component) y `ConfirmDialog` (molecule, mismo patrón de overlay accesible que `CartDrawer`)
- [x] `features/products` (admin): CRUD de productos y categorías
- [x] `features/orders` (admin): listado y cambio de estado de pedidos
- [x] Guard de rol `admin` a nivel de middleware — ampliado también a `apps/api` (ver decisiones abajo)
- [x] Tests de integración de los CRUD + E2E de login admin → editar producto

**DoD**: un usuario con rol `admin` puede gestionar catálogo y pedidos; un usuario `customer` no puede acceder a `apps/admin`. **Cumplido**: `pnpm turbo lint typecheck test build --force` en verde en los 20 paquetes/apps del monorepo (36/36 tareas); 29/29 tests de `apps/admin` y suite de `packages/ui` en verde; 9/9 specs E2E nuevos de `apps/admin` (Playwright, Chromium real) en verde, más los 13/13 de `apps/storefront` reverificados tras los cambios en paquetes compartidos (`packages/auth`, `packages/api-client`, `packages/core`).

**Decisiones tomadas con el usuario antes de implementar (plan mode)**, a partir de dos huecos reales detectados durante la exploración (no estaban en el ROADMAP original):

1. **Guard de rol también en `apps/api`, no solo en el middleware de `apps/admin`**: `POST/PATCH/DELETE /api/products` y `/api/categories` no tenían ningún guard — cualquiera podía mutar el catálogo llamando a la API directamente, sin pasar por `apps/admin`. Mismo criterio de la Fase 5 ("nunca confiar en el cliente"): nuevo `requireAdmin`/`ForbiddenError` en `apps/api/src/lib/guard.ts`, y `scopeByOwnership` (antes solo dentro de `orders/[orderId]/route.ts`) promovido al mismo archivo y reutilizado también por el listado `GET /api/orders`, que ahora devuelve todos los pedidos cuando el rol del token es `admin`.
2. **Imagen de producto como campo de texto (URL), sin widget de subida**: el seed ya sube a Cloudinary vía un script puntual (Fase 2); añadir un flujo de subida interactivo desde el formulario de admin habría sido una dependencia nueva sin caso de uso todavía (YAGNI).

**Notas técnicas no obvias de la Fase 7:**

- **`packages/api-client`'s `products.api.ts`/`categories.api.ts` ganaron un parámetro `token`** en sus mutaciones (`createProduct`, `updateProduct`, `deleteProduct`, y sus equivalentes de categoría), mismo patrón `Authorization: Bearer` que ya usaba `orders.api.ts`. Nadie las llamaba fuera de sus propios tests, cambio de firma seguro.
- **`packages/auth`'s `withAuthGuard` ganó `requiredRole`/`forbiddenRedirectPath` opcionales**, retrocompatible: `apps/storefront` sigue llamándola sin esos parámetros. Sesión válida pero rol incorrecto → redirect a `/403` (no a `/login`, mensaje engañoso; no al storefront, acoplaría el guard de una app al dominio de otra).
- **`apps/admin` sin `@tanstack/react-query` ni `zustand`**, desviación deliberada del 1:1 con `apps/storefront`: todo el CRUD de esta fase encaja en Server Actions + `revalidatePath` + `router.refresh()`/`router.push()` (mismo patrón que ya usaba `EditProfileForm` en storefront desde la Fase 5), sin necesitar caché cliente-servidor sincronizada entre vistas. Se añadiría si apareciera una necesidad real, no antes.
- **`ORDER_STATUS_BADGES` promovido a `packages/core`** (paquete vacío desde la Fase 1): 2ª aparición real del mismo mapeo de dominio (`apps/storefront`'s `format-order.ts` ya lo tenía) — decisión explícita del usuario de extraerlo en vez de duplicarlo una vez más, criterio DRY de `AGENTS.md §1.9`.
- **RHF + `zodResolver` + campos Zod con `.default()`** (`createProductSchema.stock`): el tipo de entrada del formulario (lo que maneja RHF) hace el campo opcional, aunque la salida validada (`CreateProduct`) siempre lo trae relleno — desajuste conocido entre React Hook Form y los defaults de Zod. Resuelto con el 3er genérico de `useForm<Input, Context, Output>` (soportado desde RHF 7.55+), sin tocar el schema compartido.
- **RHF + campo Zod opcional con `.min(1)`** (`createCategorySchema.description`): un campo vacío del formulario llega como `""`, no `undefined` — `""` falla `.min(1)` aunque el campo sea `.optional()`. Se normaliza en el propio `register()` con `setValueAs: (value) => value === "" ? undefined : value`, sin tocar el schema.
- **Quirk de Next.js App Router (redirect de middleware sobre una navegación "soft"/RSC)**: cuando el `signIn()` de una Server Action redirige a una ruta que el middleware vuelve a redirigir (customer autenticado aterrizando en `/products`, redirigido a `/403`), el contenido servido y renderizado ya es el de `/403` (verificado también contra el servidor real vía `curl`, con `307 Location: /403`), pero `page.url()` de Playwright no refleja la URL final en ese encadenado — una navegación completa (`page.goto`) sí la actualiza. El spec `auth.spec.ts` documenta esto y comprueba ambas cosas (contenido visible + navegación completa posterior) en vez de depender solo de la URL.
- **Puerto 3001 para `apps/admin`** (3000 storefront, 4000 api, 6006 storybook). E2E con patrón `storageState` de Playwright (`e2e/auth.setup.ts`, proyecto `setup` del que depende `chromium`): login una vez, reutilizado entre specs — anticipado ya en `AGENTS.md §6` antes de esta fase.
- **Gotcha de `.gitignore`**: un patrón con una barra intermedia (`playwright/.auth/`) queda anclado a la raíz del repo en vez de matchear a cualquier profundidad — con `apps/admin/playwright/.auth/` la coincidencia fallaba en silencio (`git status` mostraba el directorio como no rastreado). Corregido a `**/playwright/.auth/`. Patrones de un único segmento (`coverage/`, `node_modules/`) no tienen este problema porque matchean a cualquier profundidad por defecto.

**Adenda — email del cliente en la tabla de pedidos (misma sesión, 2026-07-10):** al probar la fase manualmente, el usuario pidió añadir el email del cliente a la tabla de pedidos de `apps/admin` (antes solo mostraba `shippingFullName`, un snapshot de la dirección de envío, no la cuenta). `orderSchema` (`packages/shared-types`) gana `userEmail: z.string().email()`, unido en tiempo de lectura desde la relación `User` (no un snapshot, a diferencia de los campos `shipping*`: el email de la cuenta puede cambiar después del pedido vía "Mi cuenta", y se quiere siempre el valor vigente). `apps/api`'s `toOrderDto` y los 4 puntos donde se construye un `Order` (creación en checkout, listado, detalle, cambio de estado) pasan a incluir `user: { select: { email: true } }` en la query de Prisma correspondiente. `OrdersTable` de `apps/admin` gana una columna "Email"; `createOrderFixture` de `packages/testing` gana `userEmail` por defecto.

De paso, revisando la tabla con datos reales, el usuario señaló que los emails generados por `apps/storefront/e2e/checkout.spec.ts` (`e2e-checkout-${Date.now()}-${Math.random().toString(36).slice(2)}@store-demo.test`) eran excesivamente largos (~38 caracteres antes del dominio) para lo que hacía falta. Dos iteraciones intermedias (timestamp en base36 + 4 caracteres aleatorios; luego solo 6 caracteres aleatorios) siguieron pareciéndole poco legibles — el problema de fondo no era la longitud en sí, sino que una cadena aleatoria (`sk7z3c`) no es un nombre "friendly". Solución final: `faker.internet.email({ provider: "store-demo.test" })` (mismo generador ya usado en las factories de `packages/testing`), que da nombres reales y legibles (`Valentine.Schneider@store-demo.test`) — Faker ya añade un sufijo numérico por su cuenta cuando detecta que hace falta para evitar colisiones, sin necesidad de gestionarlo a mano. Verificado que los dos tests de `checkout.spec.ts` siguen en verde sin colisión.

**Adenda — `/code-review high` + agente `bug-hunter` sobre el diff completo de la PR (misma sesión, 2026-07-11), 5 bugs reales corregidos:**

1. **Fallo de autorización real**: `PATCH /api/orders/[orderId]` usaba `requireUser` en vez de `requireAdmin` — cualquier `customer` autenticado podía cambiar el estado de su propio pedido llamando a la API directamente, saltándose la UI de `apps/admin` (la única que expone ese control). No era una regresión de esta fase: ya existía desde la Fase 5, con un comentario propio que decía literalmente "admin (Fase 7) no está acotado por userId" — esta misma fase construyó el cambio de estado de admin sobre ese endpoint sin cerrar el hueco que su propio comentario señalaba. Encontrado de forma independiente por 2 ángulos del `code-review` y por `bug-hunter`.
2. **Inconsistencia visual real**: `ProductsTable` formateaba el precio a mano (`25.00 €`, punto decimal) en vez de reutilizar `PriceTag` como ya hacía `OrdersTable` (`25,00 €`, Intl es-ES) — mismo concepto monetario mostrado de forma distinta en dos tablas de la misma app.
3. **Bug de UX real**: el `<select>` de estado de `OrdersTable` estaba atado a la prop `order.status`, así que revertía visualmente al valor anterior justo tras elegir uno nuevo mientras la petición seguía en curso, pareciendo que el cambio no se había registrado. Se pasó a llevar el listado de pedidos en estado local, actualizado con la respuesta confirmada del servidor — de paso evita el `router.refresh()` (refetch completo) que antes se disparaba tras cada cambio de una sola fila.
4. **Matcher de middleware no anclado a segmento de ruta**: `apps/admin/src/middleware.ts` excluía por prefijo de subcadena (`(?!login|403|...)`), no por segmento — una futura ruta que empezara literalmente por esos prefijos (`/login-audit`, `/api/authenticate`) habría quedado sin protección en silencio. Anclado a `/` o fin de cadena. Riesgo latente, no explotable hoy (no existe ninguna ruta así).
5. **Duplicación real, 3ª aparición**: `Input`/`Select`/`Textarea` (`packages/ui`) repetían casi verbatim el wiring de `label`/`hint`/`error`/`aria-describedby` — con `Textarea` era ya la 3ª copia del mismo bloque, el umbral que este proyecto usa para extraer en vez de seguir duplicando (`AGENTS.md §1.9`, AHA). Extraído a `useFieldDescription`/`FieldHintOrError` en `packages/ui/src/utils/`.

De paso, aplicar el fix #2 hizo aflorar un **gap de configuración preexistente y nunca ejercitado**: ni `apps/admin/vitest.config.ts` ni `apps/storefront/vitest.config.ts` declaraban el alias `@` para Vite — `tsconfig.json` lo resuelve para `tsc`/Next.js, pero Vitest usa el resolver de Vite, que no lee `paths` de tsconfig automáticamente. Nunca se había detectado porque, hasta el nuevo `apps/admin/src/lib/row-action-styles.ts` de este mismo commit, ningún componente con test unitario en ninguna de las dos apps importaba nada vía `@/...` (solo lo hacían páginas Server Component, no testeadas unitariamente). Corregido en ambos `vitest.config.ts` con `resolve.alias`.

**Hallazgos evaluados y descartados explícitamente, no arreglados:**

- **Duplicación del focus-trap entre `ConfirmDialog` y `CartDrawer`** (~40 líneas): señalada por tres ángulos del review, pero es solo la 2ª aparición del patrón — el propio comentario del código ya decía "se extrae en la 3ª aparición, no antes" (mismo criterio AHA que sí disparó la extracción #5 de arriba, que era la 3ª). Se honra la convención ya escrita en vez de extraer prematuramente.
- **`userEmail` incluido en las 4 queries de `Order` aunque `apps/storefront` nunca lo lee**: tradeoff deliberado de mantener un único DTO de `Order` simple en vez de dos formas distintas (admin/customer) — el coste (un join adicional) es marginal para el alcance de este proyecto.
- **Unicidad no garantizada de los emails de Faker en `checkout.spec.ts`**: añadir una semilla/hash determinista para blindarlo habría reintroducido la misma complejidad que el propio usuario pidió quitar dos rondas antes, para un riesgo ya mitigado en la práctica por `retries: 2` de CI y el tamaño del pool de nombres de Faker.
- **Nombres de test E2E sin empezar por "should"**: patrón ya preexistente en `apps/storefront/e2e/*.spec.ts` desde fases anteriores, no una desviación nueva introducida en esta fase.

Verificado tras los 5 fixes con `pnpm turbo lint typecheck test build --force` en verde (36/36) y las suites E2E completas de `apps/admin` (10/10) y `apps/storefront` (13/13) reejecutadas contra servidores reales.

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
