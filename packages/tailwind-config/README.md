# @store-demo/tailwind-config

Preset Tailwind v4 CSS-first (`preset.css`: `@import "tailwindcss"` + los tokens de `packages/design-tokens`) — decisión tomada explícitamente con el usuario en Fase 3, sustituye el estilo v3 (`theme.extend`/`content`) de versiones previas de la documentación.

Cada app/paquete que renderiza UI (`apps/storefront`, `apps/admin`, `apps/storybook`, `packages/ui`) importa este preset en su propio `globals.css`/entrypoint en vez de declarar su configuración de Tailwind por separado.

## Cómo verificar

```bash
pnpm turbo lint typecheck --filter=@store-demo/tailwind-config
```

Sin lógica propia que testear — se verifica por su efecto visual en las apps/Storybook que lo consumen.
