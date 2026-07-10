---
name: new-feature
description: Scaffolding de una feature nueva en apps/*/src/features/<nombre> siguiendo la estructura real del repo (api/hooks/components/lib/store) y las convenciones de AGENTS.md §3. Usar al arrancar el trabajo de una feature de dominio nueva dentro de una app (storefront/admin).
---

Genera el andamiaje de una feature nueva bajo `apps/<app>/src/features/<nombre-kebab-case>/`. No es un scaffolding genérico de 5 carpetas fijas — crea únicamente las subcarpetas que la feature concreta necesita (YAGNI, `AGENTS.md §1.10`), siguiendo la estructura ya observada en `features/cart` de `apps/storefront` como referencia real (no la lista genérica de un `CLAUDE.md` histórico):

- `api/` — Server Actions (`<verbo-recurso>.action.ts`, p. ej. `get-cart.action.ts`, `add-cart-item.action.ts`). Solo si la feature necesita mutar/leer datos de `apps/api`. Nunca hace `fetch` directo — siempre a través de `packages/api-client` (`AGENTS.md §11`).
- `hooks/` — hooks de TanStack Query (`use-<nombre>.ts`, prefijo `use`) para datos de servidor, y su query key centralizada si aplica (`<feature>-query-key.ts`, ver `features/cart/hooks/cart-query-key.ts`). Solo si hay datos de servidor que leer/mutar desde Client Components.
- `components/` — componentes propios de la feature que orquestan lógica de negocio (a diferencia de `packages/ui`, que es ciego a negocio, `AGENTS.md §1.3`). `PascalCase.tsx`, un componente por archivo.
- `lib/` — funciones puras de dominio sin estado ni I/O (p. ej. `get-cart-identity.ts`). Solo si hay lógica que merece extraerse y testearse de forma aislada.
- `store/` — store de Zustand, solo si la feature necesita estado de UI mutable con lógica de actualización que no es responsabilidad de un componente concreto (p. ej. `use-cart-drawer-store.ts`). No crear un store "por si acaso" — si el estado es solo local a un componente, usa `useState` ahí.
- `index.ts` — barrel que reexporta la API pública de la feature (`AGENTS.md §3`); no reexportar internals que no estén pensados para consumo externo.

## Pasos

1. Confirma en qué app vive (`storefront` o `admin`) y el nombre de dominio en kebab-case.
2. Antes de crear nada, comprueba en `docs/ROADMAP.md` que la fase activa cubre esta feature — no adelantes trabajo de una fase futura sin pedirlo explícitamente (`CLAUDE.md`).
3. Pregunta o infiere del contexto qué subcarpetas hacen falta realmente (no todas las features tienen las 5) — si hay ambigüedad genuina, pregunta antes de generar de más.
4. Cada archivo generado debe compilar en modo estricto (`AGENTS.md §2`) y llevar su test co-localizado si tiene lógica no trivial (`AGENTS.md §6`) — para tests más completos, usa `/write-tests` después de tener la estructura.
5. Si la feature necesita átomos/moléculas/organismos que no existen todavía en `packages/ui`, no los maquetes aquí: créalos primero con `/new-ui-component` (principio component-first, `AGENTS.md §1.6`).
