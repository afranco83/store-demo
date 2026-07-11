# @store-demo/auth

Auth.js v5 (Credentials Provider contra `apps/api`), compartido por `apps/storefront` y `apps/admin` — cada app corre su propia instancia (origen/cookies propios, sin sesión compartida entre las dos).

- `config.ts`: config completa (providers, callback `signIn` que fusiona el carrito de invitado) — solo para la Route Handler `/api/auth/[...nextauth]`.
- `auth.config.ts` / `middleware-guard.ts`: subset "edge-safe" (sin `next/headers`, sin el Credentials Provider) para `middleware.ts` — `withAuthGuard()` acepta `requiredRole`/`forbiddenRedirectPath` opcionales (usado por `apps/admin` para exigir rol `admin`).
- `get-api-token.ts` / `cookies.ts`: el JWT que `apps/api` emite en login se guarda en una cookie httpOnly propia (`api_token`), independiente del JWT cifrado de Auth.js — nunca pasa por `useSession()`/el cliente. Ver `docs/ARCHITECTURE.md §4`.

Exports vía subpaths dedicados (`@store-demo/auth/get-api-token`, `/middleware-guard`, `/cookies`) que no pasan por `config.ts`/`NextAuth()` — necesario porque ese módulo no resuelve bien bajo Vitest (ver adenda de Fase 5 en `docs/ROADMAP.md`).

## Cómo verificar

```bash
pnpm turbo lint typecheck test build --filter=@store-demo/auth
```

Solo `cookies.ts` tiene test unitario aislado (lógica pura); el resto depende de `next-auth`/`next/headers` en tiempo de ejecución real y se cubre por integración/E2E desde `apps/storefront`/`apps/admin`.
