# 0003. Sesión de Auth.js server-side, sin `SessionProvider`/Context

- **Estado**: Aceptada
- **Fecha**: 2026-07-09 (Fase 5)

## Contexto

Auth.js v5 ofrece `<SessionProvider>` + `useSession()` como forma estándar de exponer la sesión a Client Components. `docs/ARCHITECTURE.md §5` ya reserva la Context API de React para "valores semi-estáticos de configuración/inyección de dependencias en un subárbol" (sesión, tema) — `SessionProvider` encajaría ahí a primera vista.

## Decisión

No usar `SessionProvider`/`useSession()`. La sesión se resuelve con `auth()` server-side (Server Components/Server Actions) y se pasa como props explícitas a los Client Components concretos que la necesitan.

## Alternativas consideradas

- **`SessionProvider` + `useSession()`**: patrón por defecto de Auth.js, descartado porque este proyecto es Server Components por defecto (`AGENTS.md §1.4`) — la sesión ya está disponible server-side en el punto de renderizado sin necesitar un roundtrip de cliente ni envolver el árbol entero en un Client Component provider.

## Consecuencias

- El JWT que `apps/api` emite (`api_token`) nunca pasa por el callback `session()` de Auth.js ni llega a `useSession()`/al cliente — vive en su propia cookie httpOnly, leída solo server-side (`packages/auth/get-api-token.ts`). Refuerza el aislamiento entre los dos JWT independientes del sistema (el de Auth.js y el propio de `apps/api`).
- Cualquier Client Component que necesite datos de sesión (p. ej. `UserMenu`) los recibe por props desde su padre Server Component — no puede leerlos por su cuenta vía hook.
