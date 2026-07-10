---
name: check-a11y
description: Corre @axe-core/playwright contra una ruta real de apps/storefront (o admin cuando exista) y resume violaciones de accesibilidad. Complementa (no sustituye) las comprobaciones ya existentes a nivel de componente aislado. Usar antes de cerrar el DoD de accesibilidad de una fase, o para auditar una ruta concreta.
---

Audita accesibilidad a nivel de **ruta real renderizada**, no de componente aislado — eso ya lo cubren `vitest-axe` (co-localizado en cada componente de `packages/ui`, vía `expectNoAccessibilityViolations` de `packages/testing`) y el addon a11y de Storybook (`AGENTS.md §8`). Esta skill detecta problemas que solo aparecen al componer varios componentes en una página real: landmarks duplicados, orden de foco roto entre organismos, jerarquía de encabezados incoherente entre secciones.

## Estado real de la dependencia

`@axe-core/playwright` **no está instalado todavía** en este repo (verificar con `grep axe apps/storefront/package.json`) — solo `vitest-axe` en `packages/testing`/`packages/ui`. La primera vez que se use esta skill:

1. Añadir `@axe-core/playwright` como devDependency de `apps/storefront` (el paquete que ya tiene `playwright.config.ts` y `e2e/*.spec.ts`).
2. Comprobar peso/mantenimiento de la dependencia antes de fijarla (`AGENTS.md §9`, "peso de dependencias").

## Cómo correrlo

1. Identifica la ruta a auditar (p. ej. `/`, `/products/[slug]`, `/cart`, `/account`) y si necesita sesión (usar `storageState` de Playwright si ya existe, `AGENTS.md §6`, en vez de repetir login).
2. Escribe (o reutiliza si ya existe) un spec en `apps/storefront/e2e/` que navegue a la ruta y ejecute `new AxeBuilder({ page }).analyze()`.
3. Ejecuta con Playwright real (Chromium), nunca contra un mock de la página.

## Cómo reportar

Resume las violaciones agrupadas por impacto de axe (`critical`/`serious`/`moderate`/`minor`), cada una con el selector afectado y la regla WCAG incumplida. El objetivo del proyecto es WCAG 2.1 AA (`AGENTS.md §8`) — cero violaciones `critical`/`serious` es el criterio de corte para dar una ruta por cerrada, `moderate`/`minor` se valoran caso a caso.
