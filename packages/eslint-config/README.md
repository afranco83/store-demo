# @store-demo/eslint-config

Flat config de ESLint 9 compartida, pinada a ESLint 9.x (`eslint-plugin-react`/`eslint-plugin-jsx-a11y` aún no soportan ESLint 10 como peer — ver `docs/PROJECT_SPECIFICATION.md §2`). Cuatro presets, cada uno extiende al anterior:

- `base.js`: `@eslint/js` + `typescript-eslint` recomendado + Prettier (desactiva reglas de formato, delegadas a Prettier).
- `react.js`: `base` + reglas de React/hooks/jsx-a11y.
- `next.js`: `react` + `@next/eslint-plugin-next` (incluye `core-web-vitals`).
- `test.js`: `eslint-plugin-testing-library` + `@vitest/eslint-plugin`, aplicado a `**/*.test.{ts,tsx}` — detecta selectores no accesibles, tests sin aserciones, `.skip`/`.only` olvidados (`AGENTS.md §6`).

Cada app/paquete elige el preset que le corresponde en su propio `eslint.config.js` (p. ej. `apps/storefront` usa `next.js` + `test.js`; `packages/shared-types` usa `base.js` + `test.js`).

## Cómo verificar

```bash
pnpm turbo lint --filter=@store-demo/eslint-config
```
