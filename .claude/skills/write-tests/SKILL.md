---
name: write-tests
description: Genera o completa tests (unitarios/integración, co-localizados) para un componente, hook o feature dados, siguiendo el Testing Trophy y las convenciones de AGENTS.md §6. Usar tras implementar código nuevo, o para cerrar los huecos detectados por el agente test-reviewer.
---

Escribes tests siguiendo al detalle `AGENTS.md §6`. Si vienes de una auditoría del agente `test-reviewer`, céntrate en los huecos que reportó por orden de riesgo; si no, cubre primero el camino feliz de la lógica de negocio real, luego bordes (error de API, estado de carga, entrada inválida).

## Reglas no negociables (resumen operativo de `AGENTS.md §6`)

- **Ubicación**: siempre junto al archivo que testea (`Button.test.tsx` junto a `Button.tsx`), nunca en `__tests__/` separado.
- **Testing Trophy**: prioriza integración (`renderWithProviders` + MSW de `packages/testing`) sobre unitario aislado para features completas; unitario para lógica pura con muchos casos; E2E (Playwright) solo para flujos críticos completos, no como réplica exhaustiva de lo de abajo.
- **Patrón AAA**: bloques Arrange/Act/Assert diferenciados, sin mezclar.
- **Naming**: `should <resultado> when <escenario>`, siempre en inglés, nunca solo la implementación.
- **Selectores**: `getByRole`/`getByLabelText`/`getByText` primero; `data-testid="kebab-case"` solo como último recurso.
- **Interacción**: `userEvent`, nunca `fireEvent`.
- **Esperas**: `findBy*`/`waitFor` de Testing Library, nunca `setTimeout` fijo. Si un `waitFor` necesita más timeout del default, revisa también si hace falta subir el timeout del test completo (tercer argumento de `it()`) — no solo el de la aserción (gotcha real de la Fase 5).
- **Fixtures**: factories de `packages/testing` derivadas de los schemas Zod de `shared-types`, con Faker para valores concretos — nunca objetos literales inventados ni placeholders repetidos (`'test'`, `'foo'`).
- **Server Components async**: no se testean con Vitest (ningún runner Node los soporta aislados) — se cubren con specs E2E de Playwright.
- **`next/navigation`**: si el componente usa `useRouter`/`usePathname`, mockéalo con `vi.mock` (Vitest, no Jest).
- **Independencia**: `beforeEach` resetea mocks (`vi.clearAllMocks()`); cada test genera su propio dataset, sin fixtures globales compartidas.
- **Mutaciones sobre datos reales**: usa MSW para simular la respuesta de `apps/api`, no mocks que solo verifiquen "se llamó con estos argumentos" salvo que eso sea justo lo que importa comprobar.
- **Sin ruido**: sin comentarios explicando qué hace el test (el nombre ya lo dice), sin `.skip`/`.only`, sin `screen.debug()` en el código final.

## Tras escribir los tests

Ejecuta `pnpm turbo lint typecheck test build` sobre el paquete/app afectado — un test no se da por terminado hasta que pasa en verde, sin errores de tipado ni lint, con formato correcto (`AGENTS.md §6`, "Definición de hecho"). Si el paquete tiene umbral de cobertura (~80% en `packages/ui`, `packages/core`, `features/*/hooks`), confírmalo con `-- --coverage`.
