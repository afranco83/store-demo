---
name: check-a11y
description: Corre @axe-core/playwright contra una ruta real de apps/storefront o apps/admin y resume violaciones de accesibilidad. Complementa (no sustituye) las comprobaciones ya existentes a nivel de componente aislado. Usar antes de cerrar el DoD de accesibilidad de una fase, o para auditar una ruta concreta.
---

Audita accesibilidad a nivel de **ruta real renderizada**, no de componente aislado — eso ya lo cubren `vitest-axe` (co-localizado en cada componente de `packages/ui`, vía `expectNoAccessibilityViolations` de `packages/testing`) y el addon a11y de Storybook (`AGENTS.md §8`). Esta skill detecta problemas que solo aparecen al componer varios componentes en una página real: landmarks duplicados, orden de foco roto entre organismos, jerarquía de encabezados incoherente entre secciones.

`@axe-core/playwright` ya está instalado como devDependency en `apps/storefront` y `apps/admin` (Fase 8: `apps/storefront/e2e/a11y.spec.ts` y `apps/admin/e2e/a11y.spec.ts` cubren ya todas las rutas de ambas apps como parte del gate normal — usa esta skill para auditar una ruta nueva que no esté ahí todavía, o para reproducir/depurar una violación puntual).

## Cómo correrlo

1. Identifica la ruta a auditar (p. ej. `/`, `/products/[slug]`, `/cart`, `/account`) y si necesita sesión (`apps/admin` reutiliza el `storageState` del proyecto `setup`, `AGENTS.md §6`; `apps/storefront` no tiene proyecto `setup` — login manual por test, ver `a11y.spec.ts`).
2. Escribe (o reutiliza si ya existe) un spec en `apps/storefront/e2e/` o `apps/admin/e2e/` que navegue a la ruta y ejecute `new AxeBuilder({ page }).analyze()`.
3. Ejecuta con Playwright real (Chromium), nunca contra un mock de la página.

## Cómo reportar

Resume las violaciones agrupadas por impacto de axe (`critical`/`serious`/`moderate`/`minor`), cada una con el selector afectado y la regla WCAG incumplida. El objetivo del proyecto es WCAG 2.1 AA (`AGENTS.md §8`) — cero violaciones `critical`/`serious` es el criterio de corte para dar una ruta por cerrada, `moderate`/`minor` se valoran caso a caso.
