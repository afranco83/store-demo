# @store-demo/tsconfig

`tsconfig.json` base compartidos, cada app/paquete extiende el que le corresponde:

- `base.json`: `strict: true` y el resto de flags estrictos (`AGENTS.md §2`), sin JSX ni nada específico de framework — usado por paquetes puramente TS (`shared-types`, `api-client`, `core`).
- `react-library.json`: `base` + `jsx: "react-jsx"` — usado por `packages/ui`, `packages/auth`.
- `nextjs.json`: `base` + `jsx: "preserve"` (lo exige el compilador de Next.js) — usado por las apps (`storefront`, `admin`, `api`, `playground`).

## Cómo verificar

```bash
pnpm turbo typecheck --filter=@store-demo/tsconfig
```

Sin lógica propia — se verifica por que `tsc --noEmit` pase en cada consumidor.
