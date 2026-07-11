# @store-demo/testing

Infraestructura de test centralizada, consumida por `packages/ui`, `packages/api-client` y `features/*` de cada app — evita reimplementar el mismo setup en cada paquete (`AGENTS.md §6`).

- `render.ts`: `renderWithProviders` (wrapper de `render` + `userEvent.setup()` + `QueryClientProvider`).
- `query-client.ts`: `createTestQueryClient`/`createQueryWrapper` para tests de hooks de TanStack Query.
- `axe.ts`: `expectNoAccessibilityViolations`, usado por todo componente interactivo de `packages/ui`.
- `msw/`: setup del servidor MSW (`setupServer`) para interceptar `fetch` en tests de integración.
- `factories/`: generan fixtures válidas por construcción a partir de los mismos schemas Zod de `packages/shared-types`, con valores realistas de `@faker-js/faker` en vez de placeholders repetidos.
- `vitest-setup.ts`: setup compartido de Vitest (`jest-dom`, `vitest-axe`, cleanup de RTL) — cada `vitest.config.ts` consumidor lo referencia en `setupFiles`.

## Cómo verificar

```bash
pnpm turbo lint typecheck build --filter=@store-demo/testing
```

Sin test unitario propio: es infraestructura de test en sí misma, verificada por su uso real en todos los paquetes que la consumen.
