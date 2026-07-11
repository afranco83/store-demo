# 0004. Carrito de invitado: `CartItem.userId` nullable + `guestId`, no el "usuario demo" de Fase 4

- **Estado**: Aceptada
- **Fecha**: 2026-07-09 (Fase 5)

## Contexto

Fase 4 (antes de que existiera autenticación real) resolvía la identidad del carrito con un usuario demo fijo, seedeado — un hack necesario porque `CartItem.userId` era FK obligatoria a `User`. Al llegar la autenticación real (Fase 5), el usuario pidió explícitamente que un visitante anónimo pudiera comprar sin login (sesión solo exigida en checkout) y que su carrito se conservara al iniciar sesión.

## Decisión

Migración de esquema: `CartItem.userId` pasa a nullable, se añade `guestId` (con sus propios `@@unique`/índice). Un carrito es de un usuario autenticado (`userId` presente) o de un invitado (`guestId` presente, identificado por un `crypto.randomUUID()` opaco en cookie httpOnly `guest_cart_id`), nunca ambos.

## Alternativas consideradas

- **Seguir con el "usuario demo" de Fase 4** (un id arbitrario/fijo): descartado — no representa carritos de invitado reales y distintos entre sí, y no soporta la fusión al loguearse que pidió el usuario.
- **Firma criptográfica del `guestId`**: descartada por desproporcionada — un carrito de invitado no tiene datos sensibles (ni PII ni pago), así que se identifica con un UUID opaco sin verificación, mismo criterio de proporcionalidad que el resto del proyecto (ver `ARCHITECTURE.md §4`).

## Consecuencias

- El callback `signIn` de `packages/auth` fusiona el carrito de invitado en el del usuario al loguearse (`POST /api/cart/merge`, suma cantidades de productos repetidos) y borra la cookie de invitado **solo si la fusión tuvo éxito** (corregido en la ronda de `/code-review` de Fase 5 — antes se borraba siempre, perdiendo `CartItem` si `apps/api` fallaba en ese instante).
- `apps/api` deriva la identidad del carrito (usuario o invitado) en `resolveCartIdentity` (`src/lib/guard.ts`) a partir del token Bearer o del header `X-Guest-Id`, nunca de un id que el cliente ponga en la URL/body.
