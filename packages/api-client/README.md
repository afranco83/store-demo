# @store-demo/api-client

Funciones tipadas por dominio (`products.api.ts`, `categories.api.ts`, `cart.api.ts`, `orders.api.ts`, `users.api.ts`, `auth.api.ts`) para llamar a `apps/api` — el único punto del monorepo donde se hace `fetch` directo (`§Datos y red` de la capa Next, "fetch solo dentro de packages/api-client"). Cada respuesta se parsea con los schemas Zod de `packages/shared-types` (nunca se confía en el tipo declarado de `fetch` sin validar en runtime).

Errores HTTP se relanzan como `ApiClientError` (`errors.ts`) con el `status` original, para que cada consumidor decida cómo reaccionar (p. ej. `error.status === 404` → `notFound()` en un Server Component).

## Cómo verificar

```bash
pnpm turbo lint typecheck test build --filter=@store-demo/api-client
```

Tests contra MSW (`msw`, servidor interceptando `fetch`, nunca contra `apps/api` real) — umbral de cobertura 80%.
