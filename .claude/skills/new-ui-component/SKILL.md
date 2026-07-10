---
name: new-ui-component
description: Scaffolding de un átomo/molécula/organismo en packages/ui con su story y su test co-localizados, siguiendo el patrón cva+cn y las convenciones de AGENTS.md §5/§6. Usar al ampliar el design system para una página/feature nueva (workflow component-first).
---

Genera un componente nuevo en `packages/ui/src/<atoms|molecules|organisms>/<NombreComponente>/`. Este paquete es ciego a negocio (`AGENTS.md §1.3`): nunca importa Zod, TanStack Query, Zustand ni nada de `features/*` — todo entra por props.

## Nivel de Atomic Design

Antes de generar, decide el nivel correcto mirando los existentes (`packages/ui/src/atoms`, `molecules`, `organisms`):

- **Átomo**: no compone otros componentes del propio `packages/ui` (`Button`, `Input`, `Badge`).
- **Molécula**: compone átomos (`ProductCard`, `CartLineItem`).
- **Organismo**: compone moléculas/átomos en una unidad funcional completa (`Navbar`, `CartDrawer`, `UserMenu`).

Si el componente ya existe en un nivel equivalente, reutilízalo/extiéndelo con una variante nueva en vez de duplicar (`AGENTS.md §1.9`, DRY).

## Archivos a generar

- **`<Nombre>.tsx`**: variantes gestionadas con `cva` (nunca clases condicionales manuales repetidas); un prop `className` opcional fusionado con `cn` (`cx` + `twMerge`, helper de `packages/ui/src/utils/cn.ts`) para que el consumidor pueda sobreescribir lo que las variantes no contemplan. Ningún color/espaciado "mágico" fuera del preset de `packages/design-tokens`/`packages/tailwind-config` — si hace falta un valor arbitrario puntual, es una válvula de escape, no la norma (`AGENTS.md §5`).
- **`<Nombre>.stories.tsx`**: cubre las variantes/estados relevantes del componente para Storybook.
- **`<Nombre>.test.tsx`**: test de render con Testing Library (`renderWithProviders` de `packages/testing` si aplica) + `expectNoAccessibilityViolations` (de `packages/testing`, envuelve `axe`) sin violaciones — nunca declaration merging manual sobre `expect`. AAA, selectores por rol/texto accesible, `userEvent` (`AGENTS.md §6`).
- **`index.ts`**: barrel del componente.

## Accesibilidad

Objetivo WCAG 2.1 AA (`AGENTS.md §8`): roles ARIA correctos, navegable por teclado, foco visible, contraste suficiente contra los tokens de `packages/design-tokens` (incluida su variante dark si el token la tiene). No se da el componente por terminado sin pasar el addon a11y de Storybook en verde.

## Tras generarlo

Verifica que `packages/ui` sigue en 100%/umbral de cobertura (`pnpm turbo test --filter=@store-demo/ui -- --coverage`) y que el componente aparece correctamente en `apps/storybook` (`pnpm --filter @store-demo/storybook dev`).
