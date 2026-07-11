# 0006. Guard de rol `admin` también en `apps/api`, no solo en el middleware de `apps/admin`

- **Estado**: Aceptada
- **Fecha**: 2026-07-10/11 (Fase 7)

## Contexto

Al construir `apps/admin` (Fase 7), la exploración inicial detectó que `POST/PATCH/DELETE /api/products` y `/api/categories` no tenían ningún guard de autorización — cualquiera podía mutar el catálogo llamando directamente a `apps/api`, sin pasar por la UI de `apps/admin`. El guard de rol se podía limitar al middleware de `apps/admin` (bloquea el acceso a la UI) sin tocar la API.

## Decisión

Guard de rol también en `apps/api`: nuevo `requireAdmin`/`ForbiddenError` en `src/lib/guard.ts`, aplicado a las mutaciones de `products`/`categories`. El guard de middleware de `apps/admin` es una capa adicional, no la única barrera.

## Alternativas consideradas

- **Guard solo en el middleware de `apps/admin`**: descartada — un middleware de Next.js solo protege la navegación a través de esa app concreta; cualquiera con la URL de `apps/api` (que corre en su propio origen, `:4000`) podía saltárselo por completo. Contradice directamente `AGENTS.md §10` ("defensa en profundidad": cada mutación revalida sesión/rol dentro de sí misma).

## Consecuencias

- Mismo criterio ya aplicado en Fase 5 a `cart`/`orders` ("nunca confiar en el cliente") extendido aquí a `products`/`categories`.
- `scopeByOwnership` (antes solo dentro de `orders/[orderId]/route.ts`) se promovió al mismo `guard.ts` y se reutilizó también en el listado `GET /api/orders`.
- Una ronda posterior de `/code-review` + `bug-hunter` sobre el diff completo de esta misma fase encontró que `PATCH /api/orders/[orderId]` seguía usando `requireUser` en vez de `requireAdmin` — el mismo hueco de fondo que motivó este ADR, no cerrado del todo en el primer intento. Corregido en la misma fase (ver `docs/ROADMAP.md`, adenda de Fase 7).
