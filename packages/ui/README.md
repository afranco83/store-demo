# @store-demo/ui

Design system del monorepo, Atomic Design (`§Principios` (9, organización por dominio) del canon): `atoms/` (Button, Input, Select, Textarea, Badge, PriceTag, Spinner, Typography, Icon, VersionBadge), `molecules/` (ProductCard, ProductGrid, CartLineItem, ConfirmDialog, EmptyState, Hero, OrderSummaryCard, QuantitySelector, Table, WizardSteps), `organisms/` (CartDrawer, Footer, Navbar, UserMenu).

Ciego al negocio y al framework (`§Principios` (7, design system ciego al negocio) del canon): no importa Zod, TanStack Query, Zustand, `next/image` ni nada de `features/*` de una app — recibe todo por props. Cada componente vive en su propia carpeta con story de Storybook y test co-localizados (`Button/Button.tsx`, `.stories.tsx`, `.test.tsx`).

Variantes con `cva` (`class-variance-authority`) + `cn` (`twMerge`) para sobreescritura desde consumidores — ver `§Estilos` del canon.

## Cómo verificar

```bash
pnpm turbo lint typecheck test build --filter=@store-demo/ui
pnpm --filter @store-demo/storybook dev   # documentación visual + addon a11y
```

Cobertura de test: umbral 85% (líneas/funciones/ramas/statements). Todo componente interactivo lleva verificación de accesibilidad (`vitest-axe`, sin violaciones) además del test de render — ver `§Accesibilidad` del canon.
