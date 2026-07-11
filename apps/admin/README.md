# @store-demo/admin

Panel de administración (`:3001`) — segunda app de negocio del monorepo, bootstrap propio (login/`/403` independiente de `apps/storefront`, cada app con su propio origen/cookies de Auth.js) reutilizando `packages/ui`/`auth`/`api-client`. CRUD de productos y categorías, listado/cambio de estado de pedidos. Sin TanStack Query ni Zustand: alcance del CRUD resuelto con Server Actions + `revalidatePath`/`router.refresh()`.

Solo accesible con rol `admin` (Auth.js + guard de middleware + `requireAdmin` en `apps/api`, defensa en profundidad — ver `docs/ARCHITECTURE.md §4`); una sesión `customer` autenticada es redirigida a `/403`.

## Rutas

- `/login`, `/403` — públicas.
- `/products`, `/products/new`, `/products/[slug]/edit` — CRUD de catálogo.
- `/categories`, `/categories/new`, `/categories/[slug]/edit` — CRUD de categorías.
- `/orders` — listado y cambio de estado de pedidos.

## Cómo arrancar

```bash
cp apps/admin/.env.example apps/admin/.env
# AUTH_SECRET: genera uno con `npx auth secret` o `openssl rand -base64 32`

pnpm turbo dev --filter=@store-demo/api        # backend fake en :4000, requisito
pnpm turbo dev --filter=@store-demo/admin      # :3001
```

Usuario demo con rol admin (seedeado, contraseña `Password123!`): `admin@store-demo.test`.

## Cómo verificar

```bash
pnpm turbo lint typecheck test build --filter=@store-demo/admin
pnpm --filter @store-demo/admin exec playwright test   # E2E, requiere apps/api levantado
pnpm --filter @store-demo/admin run analyze             # bundle real (next experimental-analyze)
```

Cobertura de test (`AGENTS.md §6`): umbral ≥80% en `src/features/**/components` — a diferencia de `apps/storefront`, `admin` no tiene `hooks/services/store/lib/schemas` (sin TanStack Query ni Zustand, ver `docs/adr/0005-admin-without-query-zustand.md`); su lógica testeable en aislado vive en los Client Components (formularios RHF+Zod, tablas), ya cubiertos por test de integración real.
