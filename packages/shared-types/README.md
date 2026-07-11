# @store-demo/shared-types

Esquemas Zod de las entidades de dominio (`product`, `category`, `user`, `order`, `cart-item`, `shipping-address`, `payment`, `auth`) + tipos inferidos (`z.infer`), fuente única de verdad de tipos consumida por `apps/api` (validación de entrada/salida), `packages/api-client` (parseo de respuesta) y las apps (formularios con `zodResolver`).

`shipping.ts`: lógica de negocio real (no un schema) — tarifa de envío simulada y umbral de envío gratis, importada tanto por `apps/api` (cálculo autoritativo) como por `apps/storefront` (estimación en el checkout).

## Cómo verificar

```bash
pnpm turbo lint typecheck test build --filter=@store-demo/shared-types
```

Solo `shipping.ts` tiene test unitario (100% cobertura) — el resto son schemas Zod, sin ramas propias que testear en aislado (se validan por construcción y por su uso real en cada consumidor).
