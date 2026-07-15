# @store-demo/core

Utilidades de dominio compartidas entre `apps/storefront` y `apps/admin` — no lógica de un dominio de una sola app (eso vive en `features/*` de cada app), sino conceptos que aparecen en más de una (`§Principios` (5, DRY/AHA) del canon).

Hoy solo `order-status.ts` (`ORDER_STATUS_BADGES`): mapeo de `OrderStatus` a etiqueta/intención visual de `Badge`, usado por el historial de pedidos de `storefront` y la gestión de pedidos de `admin` — promovido aquí en la Fase 7 al ser la 2ª aparición real del mismo mapeo.

## Cómo verificar

```bash
pnpm turbo lint typecheck test build --filter=@store-demo/core
```

Sin test unitario propio: es un mapeo estático sin ramas/lógica que testear (`§Testing` del canon, "se evitan tests... sobre getters/wrappers triviales sin lógica").
