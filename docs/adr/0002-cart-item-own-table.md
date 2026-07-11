# 0002. `CartItem` como tabla propia, no un `Order` en estado `draft`

- **Estado**: Aceptada
- **Fecha**: 2026-07-07 (Fase 2)

## Contexto

Al diseñar el esquema Prisma del backend fake, un carrito de compra se puede modelar de dos formas habituales: como una tabla propia (`CartItem`) o reutilizando el modelo `Order` con un estado `draft` que se "confirma" en checkout.

## Decisión

`CartItem` como tabla propia e independiente de `Order`.

## Alternativas consideradas

- **`Order` en estado `draft`**: evita una tabla adicional, pero mezcla dos conceptos de dominio con ciclos de vida distintos (un carrito se muta constantemente — añadir/quitar/cambiar cantidad — mientras que un pedido confirmado es esencialmente inmutable) y complica las queries que solo quieren pedidos reales (habría que filtrar `draft` en todas partes). Descartada sin llegar a implementarse.

## Consecuencias

- El checkout (Fase 6) es una transición explícita: leer `CartItem[]` → calcular → crear `Order` (con sus `OrderItem`) → vaciar el carrito, en una única transacción de Prisma — no una mutación de estado sobre la misma fila.
- `CartItem.userId` pasó de FK obligatoria a nullable en Fase 5 (ver [ADR-0004](./0004-guest-cart-nullable-user-id.md)) sin tocar el modelo `Order` en absoluto, precisamente por estar desacoplados.
