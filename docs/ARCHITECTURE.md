# ARCHITECTURE.md

> Detalle técnico de las decisiones enunciadas en `PROJECT_SPECIFICATION.md`. Si una decisión aquí y en la especificación entran en conflicto, este documento es el que se actualiza primero (es el más específico).

---

## 1. Monorepo & Tooling

- **Gestor de paquetes**: pnpm, versión fijada vía `packageManager` en `package.json` raíz + Corepack. Node.js LTS fijado en `.nvmrc`.
- **Orquestador**: Turborepo. Pipelines mínimos: `build`, `dev`, `lint`, `test`, `test:e2e`, `typecheck`. Cache remota deshabilitada en v1 (proyecto de un solo desarrollador); posible activarla con Vercel Remote Cache si se desea demostrarla.
- **Bundler de desarrollo**: Turbopack (por defecto en `next dev` desde Next.js 15+), no Webpack — arranque y HMR sensiblemente más rápidos en local. No se añade configuración custom de Webpack salvo necesidad concreta y justificada.
- **TypeScript**: `packages/tsconfig` expone `base.json`, `nextjs.json`, `react-library.json`. Todos los `tsconfig.json` de apps/packages extienden de aquí. `strict: true` en toda la base, sin excepciones locales.
- **Lint**: `packages/eslint-config` en flat config (`eslint.config.js`), con presets `base`, `react`, `next`. Incluye `eslint-plugin-jsx-a11y` desde el preset `react`, y `eslint-plugin-testing-library` + el plugin de ESLint para Vitest en el preset aplicado a archivos `*.test.ts(x)` (ver `AGENTS.md` §6).
- **Commits**: Conventional Commits, validados con `commitlint` + hook `commit-msg` de Husky. `lint-staged` corre ESLint + Prettier en pre-commit sobre el diff.
- **Versionado interno**: Changesets para versionar `packages/*` de forma independiente y generar changelogs, aunque no se publiquen a npm (uso interno para practicar el flujo).

## 2. Design System

**No hay diseños previos en Figma.** El design system se construye de forma iterativa, a la par que se necesita para cada página; Storybook es el registro visual vivo del proyecto, no un catálogo pre-diseñado. Esto tiene una consecuencia directa de flujo de trabajo (ver §2.3).

### 2.1 Tokens y Tailwind — personalización comedida

Decisión explícita: **no se monta un pipeline de generación de tokens multiplataforma** (se descarta Style Dictionary por sobre-ingeniería para el alcance de este proyecto). En su lugar:

- Partimos de la paleta, escala tipográfica, espaciados y radios **por defecto de Tailwind**, que ya son de calidad profesional.
- `packages/design-tokens` contiene únicamente los valores que decidimos personalizar de forma justificada (color de acento de marca + una familia tipográfica propia para heading/display), como constantes TS simples **y** las custom properties CSS equivalentes (`tokens.css`) — sin capa de transformación entre ambas, se mantienen a mano.
- **Tailwind v4, CSS-first**: no hay `tailwind.config.js`. `packages/tailwind-config` expone un único `preset.css` que hace `@import "tailwindcss"` + `@import` del `tokens.css` de `design-tokens` (que trae su propio bloque `@theme`, así que los tokens personalizados quedan añadidos por encima de los defaults sin redefinir la paleta). Todas las apps consumen este preset con un único `@import` en su hoja de estilos global; ninguna app define su propia paleta en local.
- Objetivo: demostrar criterio para personalizar un design system (saber qué tocar y qué no tocar), no reconstruir Tailwind desde cero.
- **Detección de contenido**: Tailwind v4 escanea automáticamente el árbol de la app que hace el `@import` — ya no hay array `content` que mantener a mano. La única salvedad es `packages/ui`, que vive fuera del árbol de cualquier app consumidora: `preset.css` declara explícitamente `@source "../../ui/src"` una sola vez, así que todo consumidor del preset hereda esa cobertura sin tener que repetirla.

### 2.2 `packages/ui`

Atomic Design (`atoms`, `molecules`, `organisms`). Reglas:

- No importa React Hook Form, Zod, TanStack Query, Zustand ni nada de `features/*`.
- Cada componente recibe datos y callbacks por props; es "tonto" por diseño.
- Co-localización: `Button/Button.tsx`, `Button/Button.stories.tsx`, `Button/Button.test.tsx`, `Button/index.ts` (barrel).
- Accesibilidad verificada por el addon `a11y` de Storybook en cada historia.

`apps/storybook` consume `packages/ui` únicamente; no conoce ninguna app de negocio.

### 2.3 Flujo de trabajo: component-first, página a página

Al no partir de un diseño cerrado, el orden de trabajo para cualquier página/template nueva es siempre:

1. Identificar qué átomos/moléculas/organismos necesita esa página.
2. Comprobar si ya existen en `packages/ui`. Si existen, reutilizar. Si no, crearlos ahí (con su story y su test), nunca directamente dentro de la página.
3. Solo entonces ensamblar la página en `apps/<app>` a partir de esas piezas.

`packages/ui` nunca se da por "cerrado" de antemano ni se intenta completar el 100% de un inventario hipotético en una única fase: crece bajo demanda, pero siempre un paso por delante de la página que lo consume, nunca por detrás (no se permite maquetar directamente en la página "para ir más rápido" y prometer refactor a `packages/ui` después).

## 3. Backend fake (`apps/api`)

**Decisión**: Next.js App Router usado exclusivamente para Route Handlers (`app/api/**/route.ts`), sin páginas ni UI. Persistencia con **Prisma + SQLite** (fichero local, sin infraestructura externa), vía el driver adapter `@prisma/adapter-better-sqlite3` (Prisma 7 ya no admite `url` directo en el `datasource` de `schema.prisma`; la connection string vive en `prisma.config.ts`).

Razonamiento: un `json-server` no permite demostrar diseño de esquema, migraciones ni lógica de negocio en el borde servidor; un backend real (aunque ligero) sí, y es más representativo de un entorno profesional real donde el frontend consume un BFF/API propio.

Responsabilidades:

- Esquema Prisma para `Product`, `Category`, `User`, `Order`, `OrderItem`, `CartItem` _(decidido en Fase 2)_: `CartItem` es tabla propia ligada a `User`+`Product` (`@@unique([userId, productId])`), no un `Order` en estado `draft` — separa el ciclo de vida efímero del carrito del inmutable de un pedido. Dinero siempre en céntimos (`Int`): `priceCents`, `unitPriceCents` (snapshot inmutable en `OrderItem`, no duplicación real con `Product.priceCents` — son dos conceptos que deben poder divergir), `totalCents`. SQLite no soporta enums nativos de Prisma: `role`/`status` son `String`, la unión de literales vive solo en el `z.enum` de `shared-types` correspondiente.
- Migraciones versionadas (`prisma migrate`) + script de seed con datos de ejemplo (usar `@faker-js/faker` para variedad, con seed fijo para reproducibilidad). Catálogo enfocado en apparel/streetwear (Camisetas, Gorras, Zapatillas), no un e-commerce genérico. Las fotos de producto se buscan en la **API de búsqueda de Unsplash** (moderada y relevante por keyword; se descartaron `picsum.photos`/`loremflickr.com` por dar fotos irrelevantes o, en el caso de `loremflickr`, contenido inapropiado) y se re-suben a **Cloudinary** (tier gratuito, vía _unsigned upload preset_ para no requerir el API secret); el campo `imageUrl` de `Product` guarda la URL final de Cloudinary, no un binario ni un asset local.
- Validación de entrada con Zod en cada Route Handler, usando los esquemas de `packages/shared-types` (nunca se valida "a mano").
- Respuestas siempre tipadas y validadas también en la salida en desarrollo (para detectar drift entre Prisma y los contratos Zod), vía un helper `validateOutputInDev` que solo se ejecuta fuera de `NODE_ENV=production`.
- Formato de respuesta uniforme: éxito `{ data: T }`, error `{ error: { message: string } }`, con status HTTP explícito (400 validación Zod, 404 not-found, 409 conflicto de integridad referencial, 500 inesperado).
- Autenticación: endpoint de login que emite JWT, consumido por Auth.js como Credentials Provider (ver §4). Hasta que `packages/auth`/los guards de Fase 5 existan, los Route Handlers de carrito/pedidos reciben el `userId` explícito en la ruta (`/api/cart/[userId]`, `/api/orders/[userId]`) en vez de derivarlo de una sesión — hueco de autorización aceptado y documentado para esta fase, no un descuido.
- Consultas Prisma con `include`/`select` explícitos para traer relaciones en una sola query (p. ej. `Order` con sus `OrderItem`); nunca una query dentro de un bucle (N+1) para resolver relaciones.

`packages/api-client` es el único punto de la app que hace `fetch` contra `apps/api`. Expone funciones por dominio (`getProducts()`, `getProductBySlug()`, `createOrder()`...) que:

1. Hacen la petición HTTP.
2. Parsean la respuesta con el Zod schema de `shared-types` correspondiente (`schema.parse(json)`), lanzando un error tipado si no matchea.
3. Devuelven el tipo inferido (`z.infer<typeof Schema>`), nunca `any`.

Las features consumen `api-client` desde sus hooks de TanStack Query (`features/products/hooks/useProducts.ts`), nunca hacen `fetch` directamente.

**Testing**: en unit/integración, MSW intercepta las llamadas de `api-client` sin necesidad de levantar `apps/api`. En E2E (Playwright), sí corre `apps/api` real contra una SQLite de test, reseteada entre suites.

## 4. Autenticación (`packages/auth`)

- **Auth.js (NextAuth) v5**, Credentials Provider contra `apps/api` (`POST /api/auth/login`).
- Estrategia de sesión: JWT (sin sesión en base de datos, para mantener el backend fake simple).
- Roles: `customer` y `admin`, incluidos en el JWT y expuestos vía `useSession()`.
- Guards: middleware de Next.js (`middleware.ts`) en `admin` que redirige si `role !== 'admin'`; hook `useRequireAuth()` en `packages/auth` para guards a nivel de componente cuando el middleware no aplica (p.ej. secciones dentro de una página pública).
- `storefront` permite navegación anónima completa del catálogo; solo requiere sesión en checkout y "mis pedidos".

## 5. Gestión de estado — límites explícitos

| Tipo de estado                                                       | Herramienta         | Ejemplos                                                                                         |
| -------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------ |
| Estado de servidor (remoto, cacheable, con ciclo de vida propio)     | TanStack Query      | Catálogo de productos, detalle de producto, historial de pedidos, carrito persistido en backend  |
| Estado de cliente mutable, con lógica de actualización               | Zustand             | Apertura de modales/drawers, paso actual del wizard de checkout, filtros no persistidos de la UI |
| Configuración / inyección de dependencias de subárbol, semi-estática | Context API (React) | Sesión de Auth.js (`SessionProvider`), tema claro/oscuro, futura configuración de i18n           |

Reglas duras:

- Si un dato sobrevive a un refresco de página o se comparte entre pestañas vía backend → TanStack Query.
- Si es estado de cliente que cambia con frecuencia y tiene lógica de actualización (reducers, acciones, derivaciones) → Zustand.
- Si es un valor que rara vez cambia y solo se necesita "inyectar" en un subárbol sin lógica de store (p. ej. la sesión ya resuelta, el tema activo) → Context API.
- Si ninguna de las anteriores aplica y el estado no se comparte entre componentes → `useState`/`useReducer` local.

Señal de alarma: un Context que empieza a acumular múltiples acciones de actualización y lógica derivada debería migrarse a Zustand.

## 6. Testing — estrategia por capa

- **Unit** (Vitest + Testing Library): componentes de `packages/ui` en aislamiento, hooks de dominio con `renderHook`, funciones puras de `services/` y `utils/`.
- **Integración** (Vitest + Testing Library + MSW): una feature completa montada con sus providers reales (`packages/testing` expone un `renderWithProviders` que envuelve QueryClientProvider, tema, etc.), interceptando red con MSW.
- **E2E** (Playwright): flujos de usuario end-to-end contra `apps/api` real. Mínimo: navegación de catálogo → añadir al carrito → checkout completo (storefront), login → CRUD de producto (admin).
- **Accesibilidad**: `@axe-core/playwright` en los mismos specs E2E críticos + addon a11y de Storybook en cada historia de `packages/ui`. Objetivo: 0 violaciones "serias" o "críticas" de axe en las rutas principales.
- **Performance**: Lighthouse CI en GitHub Actions sobre `storefront` (build de producción), con presupuestos iniciales: LCP < 2.5s, CLS < 0.1, INP < 200ms, TBT < 200ms. Los presupuestos se afinan en Fase 8.

`packages/testing` centraliza: `renderWithProviders`, setup de servidor MSW (`setupServer`), factories de datos de dominio (usando los mismos schemas Zod de `shared-types` para generar fixtures válidas por construcción, con valores realistas generados por `@faker-js/faker` en vez de placeholders repetidos — ver `AGENTS.md` §6).

## 7. CI/CD (GitHub Actions)

Workflows mínimos:

- `ci.yml`: en cada PR — install (con cache de pnpm), `turbo lint typecheck test build` en paralelo vía Turborepo, y `test:e2e` (Playwright) contra un build de preview.
- `lighthouse.yml`: tras build de `storefront`, corre Lighthouse CI y falla si se rompe un presupuesto.
- `changesets.yml` (opcional, Fase 8): automatiza el versionado de paquetes al mergear a la rama principal.

No hay despliegue real a producción (no hay "producción"); como mucho, un despliegue de demo a Vercel para poder enlazar el proyecto desde GitHub/CV — a decidir en Fase 8.

## 8. Flujo de trabajo de desarrollo — Worktrees

Para poder trabajar en varios frentes en paralelo sin bloquearse por cambios sin commitear (p. ej. avanzar una feature mientras se corrige algo en el design system, o comparar dos aproximaciones), el desarrollo se apoya en **git worktrees** en lugar de cambiar de rama sobre un único working directory. Cada frente de trabajo relevante (fase, feature grande, spike) puede vivir en su propio worktree con su propia rama.

Consecuencias prácticas:

- No se asume que solo existe un working directory activo sobre el repo.
- El estado de `node_modules`/instalación de dependencias debe poder reproducirse por worktree (pnpm lo soporta bien vía su store global de contenido).
- Se contempla, como candidato de backlog (no comprometido todavía, ver `ROADMAP.md`), construir una pequeña app interna de gestión de worktrees (monitorización de cuáles existen, creación, edición y borrado) para no depender de comandos manuales de `git worktree` — esto sería en sí mismo una demostración adicional de tooling interno / DX.

## 9. Convenciones operativas

Delegadas íntegramente a `AGENTS.md` (naming, estructura de imports/exports, límites de Server/Client Components, formularios, etc.) para no duplicar contenido entre documentos.
