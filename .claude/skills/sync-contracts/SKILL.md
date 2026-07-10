---
name: sync-contracts
description: Verifica coherencia entre el esquema Prisma de apps/api y los esquemas Zod de packages/shared-types, señalando drift de campos/tipos/nullability. Usar tras cualquier cambio en el esquema de datos (migración de Prisma) para confirmar que los contratos siguen alineados.
---

Compara `apps/api/prisma/schema.prisma` contra `packages/shared-types/src/*.schema.ts` modelo a modelo. En este proyecto los schemas Zod se escriben **a mano** (decisión tomada en la Fase 2, `docs/ROADMAP.md`) — no hay generación automática desde Prisma, así que esta skill es una comprobación de coherencia, nunca un generador de código que sobreescriba nada.

## Mapeo de modelos a schemas (referencia, confirmar que sigue vigente)

| Modelo Prisma         | Schema Zod            |
| --------------------- | --------------------- |
| `Category`            | `category.schema.ts`  |
| `Product`             | `product.schema.ts`   |
| `User`                | `user.schema.ts`      |
| `CartItem`            | `cart-item.schema.ts` |
| `Order` / `OrderItem` | `order.schema.ts`     |

## Qué comprobar por campo

- **Presencia**: todo campo de un modelo Prisma expuesto por la API tiene su contraparte en el schema Zod correspondiente (y viceversa — ningún campo en el schema Zod que ya no exista en Prisma).
- **Tipo**: `String`↔`z.string()`, `Int`↔`z.number().int()`, `DateTime`↔`z.date()`/`z.coerce.date()` según cómo se serialice en la respuesta real, `Boolean`↔`z.boolean()`.
- **Nullable/optional**: un campo `String?` en Prisma debe reflejarse como `.nullable()`/`.optional()` en el schema Zod (y no al revés: un campo obligatorio en Prisma que el schema marca opcional es un contrato más permisivo del que el backend garantiza).
- **Valores fijos**: campos con un conjunto cerrado de valores (`status`, `role`) modelados como `String` en Prisma (SQLite no tiene enum nativo cómodo aquí) deben corresponder a un `z.enum([...])` en el schema, nunca a un `z.string()` sin restricción — es la única fuente de verdad para ese conjunto de valores en el resto del código (`AGENTS.md §2`, nunca `enum` de TypeScript en paralelo).
- **Relaciones expuestas**: si un endpoint anida una relación (p. ej. `Order` con sus `items`), el schema Zod de salida debe reflejar exactamente esa forma, no solo los campos escalares del modelo.
- **Campos sensibles nunca expuestos**: `passwordHash` de `User` nunca debe aparecer en un schema de salida pensado para llegar al cliente (`AGENTS.md §10`) — su ausencia deliberada en el schema Zod no es drift, es la protección esperada.

## Cómo reportar

Lista de discrepancias reales encontradas (campo, modelo, tipo esperado vs. tipo en el schema), no una repetición campo a campo de lo que ya coincide. Si no hay drift, dilo explícitamente.
