# @store-demo/storybook

Documentación viva del design system (`packages/ui`): historias de cada átomo/molécula/organismo, con el addon de accesibilidad (`@storybook/addon-a11y`) activo en cada una. Storybook 10 con builder `@storybook/react-vite` — `packages/ui` no depende de Next.js, así que no hace falta el builder de Next.

No monta ninguna app de negocio ni consume `apps/api`; solo renderiza los componentes de `packages/ui` con datos de ejemplo.

## Cómo arrancar

```bash
pnpm --filter @store-demo/storybook dev   # :6006
```

## Cómo verificar

```bash
pnpm turbo build --filter=@store-demo/storybook   # storybook build
```

Los tests de accesibilidad/render de cada componente viven co-localizados en `packages/ui` (Vitest + `vitest-axe`), no aquí.
