# @store-demo/design-tokens

Valores personalizados mínimos y justificados de la marca (acento `#c2410c` + tipografía display "Space Grotesk") — sin pipeline de transformación de tokens multiplataforma, deliberadamente (`docs/ROADMAP.md` Fase 3: "no se reconstruye la paleta completa desde cero"). El resto de la paleta/tipografía/espaciado son los valores por defecto de Tailwind.

Dos formatos del mismo valor, cada uno para su consumidor:

- `index.ts`: constantes TS simples (para código que necesite el valor en JS/TS).
- `tokens.css`: custom properties + bloque `@theme` para Tailwind v4 (consumido por `packages/tailwind-config`). Incluye variantes dark de `--color-accent*` (el acento a secas no llega a AA sobre fondos oscuros) ligadas a `prefers-color-scheme`, un `--color-accent-soft` propio, y `--color-accent-on-dark` (post-roadmap, footer enriquecido de storefront) para superficies _siempre_ oscuras que no dependen del tema del SO — los tres, verificados con Lighthouse/axe reales o cálculo manual de contraste (Fase 3, Fase 8 y adenda post-roadmap, ver `docs/ROADMAP.md`).

## Cómo verificar

```bash
pnpm turbo lint typecheck --filter=@store-demo/design-tokens
```

Sin test unitario: son valores estáticos, verificados por su efecto real (contraste WCAG) en los componentes que los consumen, no en aislado.
