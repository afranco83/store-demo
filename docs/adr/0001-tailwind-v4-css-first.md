# 0001. Tailwind CSS v4 en modo CSS-first, no v3 con `theme.extend`

- **Estado**: Aceptada
- **Fecha**: 2026-07-08 (Fase 3)

## Contexto

`packages/tailwind-config` necesitaba un preset compartido para tokens de marca (acento, tipografía display) consumido por `apps/storefront`, `apps/admin`, `apps/storybook` y `packages/ui`. La documentación previa (`ARCHITECTURE.md`/`PROJECT_SPECIFICATION.md`, escritas en Fase 0) asumía el estilo clásico de Tailwind v3: un `tailwind.config.ts` con `theme.extend` y un array `content` de rutas a escanear.

## Decisión

Adoptar Tailwind v4 en su modo **CSS-first**: `preset.css` con `@import "tailwindcss"` y los tokens de `packages/design-tokens` declarados como custom properties dentro de un bloque `@theme`, sin `tailwind.config.ts` ni `content` explícito (Tailwind v4 detecta los archivos a escanear automáticamente).

## Alternativas consideradas

- **Tailwind v3 con `theme.extend`**: el enfoque ya asumido en la documentación de Fase 0. Descartado al llegar a implementarlo — v4 ya era la versión estable disponible y el modo CSS-first evita mantener un archivo de configuración TS en paralelo a los tokens CSS.

## Consecuencias

- `ARCHITECTURE.md` y `PROJECT_SPECIFICATION.md` (que asumían v3) se actualizaron para reflejar v4 CSS-first como la decisión real.
- Los tokens de marca viven en un único lugar (`packages/design-tokens/src/tokens.css`), sin duplicarse entre un `tailwind.config.ts` y un archivo CSS.
- Cualquier convención futura de Tailwind en el repo asume v4 CSS-first; no es intercambiable con ejemplos/documentación de v3 sin adaptar.
