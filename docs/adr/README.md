# Architecture Decision Records

Decisiones de arquitectura individuales, formato [MADR](https://adr.github.io/madr/) (ver [plantilla](./0000-template.md)). Complementan a `docs/ROADMAP.md`: el ROADMAP narra el progreso cronológico de cada fase, un ADR es atómico e inmutable — una decisión, un archivo, nunca editado después (si la decisión cambia, se crea un ADR nuevo que la sustituye).

Adoptado en Fase 8. Los ADRs `0001`-`0006` son retroactivos: documentan decisiones ya tomadas y descritas en las adendas de `docs/ROADMAP.md`, formalizadas aquí con su propio archivo. A partir de aquí, cualquier decisión de arquitectura nueva y significativa (no un detalle de implementación) se documenta con un ADR en el momento en que se toma.

| ADR                                                  | Decisión                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| [0001](./0001-tailwind-v4-css-first.md)              | Tailwind CSS v4 en modo CSS-first, no v3 con `theme.extend`       |
| [0002](./0002-cart-item-own-table.md)                | `CartItem` como tabla propia, no un `Order` en estado `draft`     |
| [0003](./0003-no-session-provider.md)                | Sesión de Auth.js server-side, sin `SessionProvider`/Context      |
| [0004](./0004-guest-cart-nullable-user-id.md)        | Carrito de invitado: `CartItem.userId` nullable + `guestId`       |
| [0005](./0005-admin-without-query-zustand.md)        | `apps/admin` sin TanStack Query ni Zustand                        |
| [0006](./0006-api-role-guard-not-just-middleware.md) | Guard de rol `admin` también en `apps/api`, no solo en middleware |
